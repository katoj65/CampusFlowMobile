-- Extras now belong to a university, same as meals — each university
-- manages its own extras list. The 3 existing rows become University of
-- Luxembourg's list (kept as their original rows since cart_items/
-- order_items already reference them); duplicated as fresh rows for every
-- other university so everyone starts with the same 3-item starter list.

alter table public.meal_extras add column university_id bigint references public.universities (id);

update public.meal_extras
set university_id = (select id from public.universities where name = 'University of Luxembourg')
where university_id is null;

alter table public.meal_extras alter column university_id set not null;

insert into public.meal_extras (label, price_delta, university_id)
select e.label, e.price_delta, u.id
from public.meal_extras e
cross join public.universities u
where e.university_id = (select id from public.universities where name = 'University of Luxembourg')
  and u.id <> (select id from public.universities where name = 'University of Luxembourg');

-- Students may only see extras belonging to their own university (mirrors
-- the meals RLS policy from 0023_meals_strict_university_rls.sql).
drop policy if exists "Meal extras are publicly readable" on public.meal_extras;

create policy "Meal extras are readable by students of the same university"
  on public.meal_extras for select
  to authenticated
  using (
    university_id = (
      select university_id from public.profiles where id = auth.uid()
    )
  );
