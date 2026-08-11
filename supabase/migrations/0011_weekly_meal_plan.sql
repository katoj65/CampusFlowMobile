-- Weekly meal plan: for each day of the week, which meal (from the existing
-- catalog) the student wants to eat, plus a single order-time preference
-- that applies across the whole week. Preference data only — no automatic
-- ordering happens here; placing the actual order is still a manual step
-- elsewhere in the app.

alter table public.profiles
  add column weekly_order_time time not null default '10:00:00';

create table public.weekly_meal_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7), -- 1 = Monday .. 7 = Sunday
  meal_id bigint references public.meals (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_of_week)
);

alter table public.weekly_meal_plan enable row level security;

create policy "Users can view their own weekly meal plan"
  on public.weekly_meal_plan for select
  using (auth.uid() = user_id);

create policy "Users can add to their own weekly meal plan"
  on public.weekly_meal_plan for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly meal plan"
  on public.weekly_meal_plan for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can remove from their own weekly meal plan"
  on public.weekly_meal_plan for delete
  using (auth.uid() = user_id);
