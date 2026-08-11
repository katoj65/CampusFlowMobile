-- Remaining uuid primary keys with no incoming foreign keys — simple
-- swap to a system-generated bigint identity each, preserving existing rows.

alter table public.notifications add column id_new bigint generated always as identity;
alter table public.notifications drop constraint notifications_pkey;
alter table public.notifications drop column id;
alter table public.notifications rename column id_new to id;
alter table public.notifications add primary key (id);

alter table public.wallet_transactions add column id_new bigint generated always as identity;
alter table public.wallet_transactions drop constraint wallet_transactions_pkey;
alter table public.wallet_transactions drop column id;
alter table public.wallet_transactions rename column id_new to id;
alter table public.wallet_transactions add primary key (id);

alter table public.weekly_meal_plan add column id_new bigint generated always as identity;
alter table public.weekly_meal_plan drop constraint weekly_meal_plan_pkey;
alter table public.weekly_meal_plan drop column id;
alter table public.weekly_meal_plan rename column id_new to id;
alter table public.weekly_meal_plan add primary key (id);

alter table public.cart_items add column id_new bigint generated always as identity;
alter table public.cart_items drop constraint cart_items_pkey;
alter table public.cart_items drop column id;
alter table public.cart_items rename column id_new to id;
alter table public.cart_items add primary key (id);
