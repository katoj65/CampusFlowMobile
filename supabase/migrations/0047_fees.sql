-- Public read-only reference data, requested as: title, description, fee, tag.
create table public.fees (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null default '',
  fee numeric(10, 2) not null,
  tag text not null default '',
  created_at timestamptz not null default now()
);

alter table public.fees enable row level security;

create policy "Fees are publicly readable"
  on public.fees for select
  to anon, authenticated
  using (true);
