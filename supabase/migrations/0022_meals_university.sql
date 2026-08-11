-- Meals now belong to a university — each university manages its own menu,
-- students only order from their own. The 13 existing meals become
-- University of Luxembourg's catalog (kept as their original rows since
-- order_items/weekly_meal_plan already reference them via real data);
-- duplicated as fresh rows for every other university so everyone starts
-- with the same 13-item starter menu. Categories stay global/shared —
-- only meals are university-scoped.

alter table public.meals add column university_id bigint references public.universities (id);

update public.meals
set university_id = (select id from public.universities where name = 'University of Luxembourg')
where university_id is null;

alter table public.meals alter column university_id set not null;

insert into public.meals
  (name, description, image_url, price, category_id, tags, calories, available, ingredients, customizable, university_id)
select m.name, m.description, m.image_url, m.price, m.category_id, m.tags, m.calories, m.available, m.ingredients, m.customizable, u.id
from public.meals m
cross join public.universities u
where m.university_id = (select id from public.universities where name = 'University of Luxembourg')
  and u.id <> (select id from public.universities where name = 'University of Luxembourg');
