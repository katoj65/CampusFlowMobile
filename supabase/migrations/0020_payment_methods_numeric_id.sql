-- payment_methods.id was uuid; wallet_transactions.payment_method_id
-- references it and has real rows now. Remap in place — preserves the
-- actual payment method rows (label/detail/is_default) and the existing
-- wallet transaction history's link to them.

alter table public.wallet_transactions drop constraint wallet_transactions_payment_method_id_fkey;
alter table public.wallet_transactions add column payment_method_id_new bigint;

alter table public.payment_methods add column id_new bigint generated always as identity;

update public.wallet_transactions wt
set payment_method_id_new = pm.id_new
from public.payment_methods pm
where wt.payment_method_id = pm.id;

alter table public.payment_methods drop constraint payment_methods_pkey;
alter table public.payment_methods drop column id;
alter table public.payment_methods rename column id_new to id;
alter table public.payment_methods add primary key (id);

alter table public.wallet_transactions drop column payment_method_id;
alter table public.wallet_transactions rename column payment_method_id_new to payment_method_id;
alter table public.wallet_transactions
  add constraint wallet_transactions_payment_method_id_fkey
  foreign key (payment_method_id) references public.payment_methods (id) on delete set null;
