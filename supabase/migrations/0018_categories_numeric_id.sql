-- All tables need a numeric, system-generated (auto-increment) id.
-- categories.id was a text slug; meals.category_id references it, so both
-- change together. Pure reference/seed data — recreated cleanly with the
-- same rows the original 0002 migration seeded, in the same order, so the
-- new identity ids land 1..7 exactly as categories.id would have.
--
-- profiles.id (and wallets.user_id, which mirrors it) are the one
-- exception: they must stay uuid — they ARE auth.users.id, an identifier
-- Supabase's own auth system assigns and owns, not something this schema
-- can renumber.

alter table public.meals drop constraint meals_category_id_fkey;
alter table public.meals add column category_id_new bigint;

drop table public.categories;

create table public.categories (
  id bigint generated always as identity primary key,
  label text not null,
  icon text not null
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

insert into public.categories (label, icon) values
  ('All', 'fast-food-outline'),
  ('Breakfast', 'sunny-outline'),
  ('Mains', 'restaurant-outline'),
  ('Salads & Bowls', 'leaf-outline'),
  ('Grill', 'flame-outline'),
  ('Drinks', 'cafe-outline'),
  ('Desserts', 'ice-cream-outline');

update public.meals set category_id_new = (select id from public.categories where label = 'Breakfast') where category_id = 'breakfast';
update public.meals set category_id_new = (select id from public.categories where label = 'Mains') where category_id = 'mains';
update public.meals set category_id_new = (select id from public.categories where label = 'Salads & Bowls') where category_id = 'salads';
update public.meals set category_id_new = (select id from public.categories where label = 'Grill') where category_id = 'grill';
update public.meals set category_id_new = (select id from public.categories where label = 'Drinks') where category_id = 'drinks';
update public.meals set category_id_new = (select id from public.categories where label = 'Desserts') where category_id = 'desserts';

alter table public.meals drop column category_id;
alter table public.meals rename column category_id_new to category_id;
alter table public.meals alter column category_id set not null;
alter table public.meals add constraint meals_category_id_fkey foreign key (category_id) references public.categories (id);
