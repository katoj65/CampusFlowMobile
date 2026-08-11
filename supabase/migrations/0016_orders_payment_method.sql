-- Orders never actually recorded which payment method was used — checkout
-- selected one (for the wallet deduction) but it was discarded afterward.
-- Snapshot the label at order time, same pattern as wallet_transactions.source_label.

alter table public.orders
  add column payment_method text not null default 'Cash on Pickup';

alter table public.orders alter column payment_method drop default;
