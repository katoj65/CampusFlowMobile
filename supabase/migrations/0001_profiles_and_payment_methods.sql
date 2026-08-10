-- Profiles (1:1 with auth.users) and payment methods, seeded automatically on signup.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  telephone text,
  student_id text,
  primary_diet text not null default 'No Preference',
  allergies text[] not null default '{}',
  wallet_balance numeric(10, 2) not null default 0,
  member_since timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('card', 'wallet', 'cash')),
  label text not null,
  detail text not null,
  is_default boolean not null default false,
  removable boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

create policy "Users can manage their own payment methods"
  on public.payment_methods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Creates a profile row (from signup metadata) plus the default wallet and
-- cash payment methods every account starts with, mirroring the previous
-- mock-data seed. security definer is required since this fires as part of
-- the auth.users insert, before the new user's own RLS session exists.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, telephone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone'
  );

  insert into public.payment_methods (user_id, type, label, detail, is_default, removable)
  values
    (new.id, 'wallet', 'Campus Wallet', '€0.00 balance', false, false),
    (new.id, 'cash', 'Cash on Pickup', 'Pay at the counter', false, false);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
