-- Cart persisted server-side (previously client-only state). Every row is
-- fully owned and removable by its user — unlike payment_methods there's no
-- "protected" row here, so a single full-CRUD policy is enough.

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_id bigint not null references public.meals (id),
  name text not null,
  image_url text not null,
  unit_price numeric(10, 2) not null,
  qty int not null check (qty > 0 and qty <= 10),
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cart_items enable row level security;

create policy "Users can manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
