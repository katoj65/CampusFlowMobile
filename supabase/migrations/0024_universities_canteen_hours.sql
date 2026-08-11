-- Each university's canteen has its own opening hours: a daily open/close time,
-- and the range of weekdays it operates on.

alter table public.universities
  add column canteen_opens_at time,
  add column canteen_closes_at time,
  add column canteen_open_from_day text,
  add column canteen_open_to_day text;

alter table public.universities
  add constraint universities_canteen_open_from_day_check
    check (canteen_open_from_day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  add constraint universities_canteen_open_to_day_check
    check (canteen_open_to_day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'));

update public.universities
set
  canteen_opens_at = '08:00',
  canteen_closes_at = '18:00',
  canteen_open_from_day = 'Monday',
  canteen_open_to_day = 'Friday'
where canteen_opens_at is null;

alter table public.universities
  alter column canteen_opens_at set not null,
  alter column canteen_closes_at set not null,
  alter column canteen_open_from_day set not null,
  alter column canteen_open_to_day set not null;
