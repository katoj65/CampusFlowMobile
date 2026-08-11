-- Postgres grants EXECUTE on new functions to PUBLIC by default, which
-- 0004 didn't revoke — so anon (and any future role) could call the wallet
-- functions too. Not currently exploitable (auth.uid() is null for anon,
-- so "where user_id = auth.uid()" matches no wallet and the function
-- raises "Wallet not found"), but least-privilege says only authenticated
-- sessions should be able to invoke these at all.

revoke execute on function public.wallet_top_up(numeric) from public;
revoke execute on function public.wallet_withdraw(numeric) from public;
revoke execute on function public.wallet_pay(numeric, bigint, text) from public;

grant execute on function public.wallet_top_up(numeric) to authenticated;
grant execute on function public.wallet_withdraw(numeric) to authenticated;
grant execute on function public.wallet_pay(numeric, bigint, text) to authenticated;
