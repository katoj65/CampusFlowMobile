-- Meals added directly via the Supabase dashboard (for universities 22 and
-- 28, added outside the original seed/migration flow) were all left at the
-- customizable column's default of false — including entrees/mains/salads
-- that should be customizable like their counterparts in every seeded
-- university. This is why the Add Extras/Size/Spice section never showed
-- for those meals: it's gated behind meal.customizable client-side.
-- Drinks/Desserts stay non-customizable, matching every other university.

update public.meals
set customizable = true
where university_id in (22, 28)
  and category_id not in (select id from public.categories where label in ('Drinks', 'Desserts'));
