-- pickup_locations.id was a text slug; orders.pickup_location_id
-- references it and has real rows now, so remap in place rather than
-- dropping — preserves the existing orders' pickup location.

alter table public.orders drop constraint orders_pickup_location_id_fkey;
alter table public.orders add column pickup_location_id_new bigint;

drop table public.pickup_locations;

create table public.pickup_locations (
  id bigint generated always as identity primary key,
  name text not null,
  building text not null,
  walk_time text not null,
  hours text not null
);

alter table public.pickup_locations enable row level security;

create policy "Pickup locations are publicly readable"
  on public.pickup_locations for select
  to anon, authenticated
  using (true);

insert into public.pickup_locations (name, building, walk_time, hours) values
  ('Mensa Ground Floor, Counter 2', 'Main Mensa', '2 min', '11:00 – 20:00'),
  ('Mensa Ground Floor, Counter 1', 'Main Mensa', '2 min', '11:00 – 20:00'),
  ('Library Café', 'Central Library', '6 min', '08:00 – 18:00'),
  ('Engineering Building Kiosk', 'Building C', '9 min', '09:00 – 16:00');

update public.orders set pickup_location_id_new = (select id from public.pickup_locations where name = 'Mensa Ground Floor, Counter 2') where pickup_location_id = 'mensa-c2';
update public.orders set pickup_location_id_new = (select id from public.pickup_locations where name = 'Mensa Ground Floor, Counter 1') where pickup_location_id = 'mensa-c1';
update public.orders set pickup_location_id_new = (select id from public.pickup_locations where name = 'Library Café') where pickup_location_id = 'library-cafe';
update public.orders set pickup_location_id_new = (select id from public.pickup_locations where name = 'Engineering Building Kiosk') where pickup_location_id = 'engineering-kiosk';

alter table public.orders drop column pickup_location_id;
alter table public.orders rename column pickup_location_id_new to pickup_location_id;
alter table public.orders add constraint orders_pickup_location_id_fkey foreign key (pickup_location_id) references public.pickup_locations (id);
