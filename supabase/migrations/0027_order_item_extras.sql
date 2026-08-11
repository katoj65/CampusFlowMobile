-- Track selected extras as structured data instead of only inside the
-- free-text summary, so order history/receipts can show an extras
-- breakdown. extras_total_price is the portion of unit_price contributed
-- by the selected extras (unit_price itself is unchanged — it already
-- includes extras, as it did before this migration).

alter table public.cart_items
  add column extras text[] not null default '{}',
  add column extras_total_price numeric(10, 2) not null default 0;

alter table public.order_items
  add column extras text[] not null default '{}',
  add column extras_total_price numeric(10, 2) not null default 0;
