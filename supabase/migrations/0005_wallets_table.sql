-- Move the wallet balance out of profiles into its own table. profiles stays
-- identity/preferences; wallets is financial state, mirroring the same
-- pattern already used for wallet_transactions (the audit log next to it).

create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "Users can view their own wallet"
  on public.wallets for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy — rows are created by the signup trigger
-- and mutated only by the security-definer functions below, same as
-- wallet_transactions.

-- Backfill any existing balances before the source column goes away.
insert into public.wallets (user_id, balance)
select id, wallet_balance from public.profiles
on conflict (user_id) do nothing;

alter table public.profiles drop column wallet_balance;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, telephone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone'
  );

  insert into public.wallets (user_id) values (new.id);

  insert into public.payment_methods (user_id, type, label, detail, is_default, removable)
  values
    (new.id, 'wallet', 'Campus Wallet', '€0.00 balance', false, false),
    (new.id, 'cash', 'Cash on Pickup', 'Pay at the counter', false, false);

  return new;
end;
$$;

create or replace function public.wallet_top_up(p_amount numeric)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_new_balance numeric(10, 2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Top-up amount must be greater than zero';
  end if;
  if p_amount > 500 then
    raise exception 'Top-up amount exceeds the maximum of €500 per transaction';
  end if;

  update public.wallets
  set balance = balance + p_amount, updated_at = now()
  where user_id = auth.uid()
  returning balance into v_new_balance;

  if not found then
    raise exception 'Wallet not found';
  end if;

  insert into public.wallet_transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'top_up', p_amount, v_new_balance);

  return v_new_balance;
end;
$$;

create or replace function public.wallet_withdraw(p_amount numeric)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_current_balance numeric(10, 2);
  v_new_balance numeric(10, 2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  select balance into v_current_balance
  from public.wallets
  where user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Wallet not found';
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.wallets
  set balance = balance - p_amount, updated_at = now()
  where user_id = auth.uid()
  returning balance into v_new_balance;

  insert into public.wallet_transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'withdrawal', p_amount, v_new_balance);

  return v_new_balance;
end;
$$;

create or replace function public.wallet_pay(p_amount numeric, p_order_id bigint default null, p_note text default null)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_current_balance numeric(10, 2);
  v_new_balance numeric(10, 2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select balance into v_current_balance
  from public.wallets
  where user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Wallet not found';
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.wallets
  set balance = balance - p_amount, updated_at = now()
  where user_id = auth.uid()
  returning balance into v_new_balance;

  insert into public.wallet_transactions (user_id, type, amount, balance_after, order_id, note)
  values (auth.uid(), 'payment', p_amount, v_new_balance, p_order_id, p_note);

  return v_new_balance;
end;
$$;

grant execute on function public.wallet_top_up(numeric) to authenticated;
grant execute on function public.wallet_withdraw(numeric) to authenticated;
grant execute on function public.wallet_pay(numeric, bigint, text) to authenticated;
