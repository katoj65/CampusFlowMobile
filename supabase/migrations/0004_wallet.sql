-- Campus Wallet: an auditable ledger plus security-definer functions for
-- every balance change. wallet_balance on profiles is the current balance;
-- wallet_transactions is the append-only history of how it got there.
--
-- The existing "Users can update their own profile" policy on profiles
-- (0001) covers the whole row, which would let a client set wallet_balance
-- to anything via a plain update() call. Column-level privileges close
-- that gap: authenticated can no longer write wallet_balance directly, only
-- through the functions below (which run as the table owner and bypass
-- this restriction, same as they bypass RLS).
revoke update (wallet_balance) on public.profiles from authenticated;

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('top_up', 'withdrawal', 'payment', 'refund')),
  amount numeric(10, 2) not null check (amount > 0),
  balance_after numeric(10, 2) not null,
  order_id bigint references public.orders (id),
  note text,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can view their own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policy — the ledger is only ever
-- appended to by the functions below, never directly by a client.

create function public.wallet_top_up(p_amount numeric)
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

  update public.profiles
  set wallet_balance = wallet_balance + p_amount, updated_at = now()
  where id = auth.uid()
  returning wallet_balance into v_new_balance;

  if not found then
    raise exception 'Profile not found';
  end if;

  insert into public.wallet_transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'top_up', p_amount, v_new_balance);

  return v_new_balance;
end;
$$;

create function public.wallet_withdraw(p_amount numeric)
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

  select wallet_balance into v_current_balance
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.profiles
  set wallet_balance = wallet_balance - p_amount, updated_at = now()
  where id = auth.uid()
  returning wallet_balance into v_new_balance;

  insert into public.wallet_transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'withdrawal', p_amount, v_new_balance);

  return v_new_balance;
end;
$$;

create function public.wallet_pay(p_amount numeric, p_order_id bigint default null, p_note text default null)
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

  select wallet_balance into v_current_balance
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.profiles
  set wallet_balance = wallet_balance - p_amount, updated_at = now()
  where id = auth.uid()
  returning wallet_balance into v_new_balance;

  insert into public.wallet_transactions (user_id, type, amount, balance_after, order_id, note)
  values (auth.uid(), 'payment', p_amount, v_new_balance, p_order_id, p_note);

  return v_new_balance;
end;
$$;

grant execute on function public.wallet_top_up(numeric) to authenticated;
grant execute on function public.wallet_withdraw(numeric) to authenticated;
grant execute on function public.wallet_pay(numeric, bigint, text) to authenticated;
