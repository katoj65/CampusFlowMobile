-- Switch universities.id from a text slug to a numeric identity, per
-- request. Safe to drop and recreate outright — no registered account has
-- university_id set yet (0013 only just introduced the column).

alter table public.profiles drop constraint if exists profiles_university_id_fkey;
alter table public.profiles drop column if exists university_id;

drop table if exists public.universities;

create table public.universities (
  id bigint generated always as identity primary key,
  name text not null,
  city text not null,
  country text not null
);

alter table public.universities enable row level security;

create policy "Universities are publicly readable"
  on public.universities for select
  to anon, authenticated
  using (true);

insert into public.universities (name, city, country) values
  ('University of Luxembourg', 'Esch-sur-Alzette', 'Luxembourg'),
  ('LUNEX University', 'Differdange', 'Luxembourg'),
  ('Sacred Heart University Luxembourg', 'Luxembourg City', 'Luxembourg'),
  ('Miami University Dolibois European Center', 'Differdange', 'Luxembourg'),
  ('University of Trier', 'Trier', 'Germany'),
  ('Saarland University', 'Saarbrücken', 'Germany'),
  ('University of Liège', 'Liège', 'Belgium'),
  ('KU Leuven', 'Leuven', 'Belgium'),
  ('University of Lorraine', 'Nancy', 'France'),
  ('Other / Not Listed', '—', '—');

alter table public.profiles
  add column university_id bigint references public.universities (id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, telephone, university_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone',
    nullif(new.raw_user_meta_data ->> 'university_id', '')::bigint
  );

  insert into public.wallets (user_id) values (new.id);

  insert into public.payment_methods (user_id, type, label, detail, is_default, removable)
  values
    (new.id, 'wallet', 'Campus Wallet', '€0.00 balance', false, false),
    (new.id, 'cash', 'Cash on Pickup', 'Pay at the counter', false, false);

  return new;
end;
$$;
