-- Universities: public read-only reference data for the registration form,
-- same pattern as categories/meals/pickup_locations. profiles.university_id
-- is nullable at the DB level (signup shouldn't hard-fail if it's ever
-- missing) — "must select one" is enforced client-side on the register form.

create table public.universities (
  id text primary key,
  name text not null,
  city text not null,
  country text not null
);

alter table public.universities enable row level security;

create policy "Universities are publicly readable"
  on public.universities for select
  to anon, authenticated
  using (true);

insert into public.universities (id, name, city, country) values
  ('uni-lu', 'University of Luxembourg', 'Esch-sur-Alzette', 'Luxembourg'),
  ('lunex', 'LUNEX University', 'Differdange', 'Luxembourg'),
  ('sacred-heart-lux', 'Sacred Heart University Luxembourg', 'Luxembourg City', 'Luxembourg'),
  ('miami-dolibois', 'Miami University Dolibois European Center', 'Differdange', 'Luxembourg'),
  ('uni-trier', 'University of Trier', 'Trier', 'Germany'),
  ('uni-saarland', 'Saarland University', 'Saarbrücken', 'Germany'),
  ('uni-liege', 'University of Liège', 'Liège', 'Belgium'),
  ('kuleuven', 'KU Leuven', 'Leuven', 'Belgium'),
  ('uni-lorraine', 'University of Lorraine', 'Nancy', 'France'),
  ('other', 'Other / Not Listed', '—', '—');

alter table public.profiles
  add column university_id text references public.universities (id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, telephone, university_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone',
    new.raw_user_meta_data ->> 'university_id'
  );

  insert into public.wallets (user_id) values (new.id);

  insert into public.payment_methods (user_id, type, label, detail, is_default, removable)
  values
    (new.id, 'wallet', 'Campus Wallet', '€0.00 balance', false, false),
    (new.id, 'cash', 'Cash on Pickup', 'Pay at the counter', false, false);

  return new;
end;
$$;
