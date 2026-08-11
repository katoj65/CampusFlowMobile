-- Public read-only reference data for meal customization add-ons
-- (previously the hardcoded `commonExtras` array in src/data/menu.ts).
-- No client write policies — managed via the Supabase dashboard.

create table public.meal_extras (
  id bigint generated always as identity primary key,
  label text not null,
  price_delta numeric(10, 2) not null default 0
);

alter table public.meal_extras enable row level security;

create policy "Meal extras are publicly readable"
  on public.meal_extras for select
  to anon, authenticated
  using (true);

insert into public.meal_extras (label, price_delta) values
  ('Extra Sauce', 0.5),
  ('Extra Cheese', 0.7),
  ('Side of Bread', 0.9);
