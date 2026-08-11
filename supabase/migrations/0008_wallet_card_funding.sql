-- Top-up and withdrawal now go through a saved card. Still simulated —
-- no real charge or payout, same demo scope as the rest of payment_methods
-- (see payment.demoDisclaimer in the app) — but the ledger now records
-- which card was used, snapshotted so it stays meaningful even if the card
-- is later removed.

alter table public.wallet_transactions
  add column payment_method_id uuid references public.payment_methods (id) on delete set null,
  add column source_label text;

-- Adding a parameter changes the function's signature/identity in Postgres,
-- so create-or-replace won't just update these in place — drop the old
-- one-arg overloads first or they'd linger callable alongside the new ones.
drop function if exists public.wallet_top_up(numeric);
drop function if exists public.wallet_withdraw(numeric);

create function public.wallet_top_up(p_amount numeric, p_payment_method_id uuid default null)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_new_balance numeric(10, 2);
  v_source_label text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Top-up amount must be greater than zero';
  end if;
  if p_amount > 500 then
    raise exception 'Top-up amount exceeds the maximum of €500 per transaction';
  end if;

  if p_payment_method_id is not null then
    select label || ' ' || detail into v_source_label
    from public.payment_methods
    where id = p_payment_method_id and user_id = auth.uid() and type = 'card';

    if v_source_label is null then
      raise exception 'Card not found';
    end if;
  end if;

  update public.wallets
  set balance = balance + p_amount, updated_at = now()
  where user_id = auth.uid()
  returning balance into v_new_balance;

  if not found then
    raise exception 'Wallet not found';
  end if;

  insert into public.wallet_transactions (user_id, type, amount, balance_after, payment_method_id, source_label)
  values (auth.uid(), 'top_up', p_amount, v_new_balance, p_payment_method_id, v_source_label);

  return v_new_balance;
end;
$$;

create function public.wallet_withdraw(p_amount numeric, p_payment_method_id uuid default null)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_current_balance numeric(10, 2);
  v_new_balance numeric(10, 2);
  v_source_label text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  if p_payment_method_id is not null then
    select label || ' ' || detail into v_source_label
    from public.payment_methods
    where id = p_payment_method_id and user_id = auth.uid() and type = 'card';

    if v_source_label is null then
      raise exception 'Card not found';
    end if;
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

  insert into public.wallet_transactions (user_id, type, amount, balance_after, payment_method_id, source_label)
  values (auth.uid(), 'withdrawal', p_amount, v_new_balance, p_payment_method_id, v_source_label);

  return v_new_balance;
end;
$$;

-- Supabase auto-grants EXECUTE to anon/authenticated on new functions at
-- creation time (see 0006/0007) — lock these down from the start instead
-- of needing another follow-up migration.
revoke execute on function public.wallet_top_up(numeric, uuid) from public, anon;
revoke execute on function public.wallet_withdraw(numeric, uuid) from public, anon;
grant execute on function public.wallet_top_up(numeric, uuid) to authenticated;
grant execute on function public.wallet_withdraw(numeric, uuid) to authenticated;
