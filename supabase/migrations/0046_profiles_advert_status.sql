-- Per-user preference: whether the dashboard hero shows the latest advert
-- banner. Covered by the existing self-scoped select/update policies on
-- profiles — no new RLS policy needed.

alter table public.profiles
  add column advert_status text not null default 'shown' check (advert_status in ('shown', 'hidden'));
