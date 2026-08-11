-- Students may only see meals belonging to their own university (no cross-university
-- browsing, and no fallback to the full catalog client-side).

drop policy if exists "Meals are publicly readable" on public.meals;

create policy "Meals are readable by students of the same university"
  on public.meals for select
  to authenticated
  using (
    university_id = (
      select university_id from public.profiles where id = auth.uid()
    )
  );
