-- adverts already exists (created by a separate admin-panel project that
-- applies its own migrations directly to this database — see git history
-- around 2026-08-13 for context). Its existing policies only let a
-- university's admin manage/read their own adverts. This adds a read-only
-- policy for students, scoped to their own university, mirroring the
-- meals/meal_extras university-scoping pattern — purely additive, doesn't
-- touch the admin policies or the table itself.

create policy "Adverts are readable by students of the same university"
  on public.adverts for select
  to authenticated
  using (
    university_id = (
      select university_id from public.profiles where id = auth.uid()
    )
  );
