-- 0006's "revoke ... from public" didn't actually remove anon's access —
-- Supabase provisions every project with default privileges on the public
-- schema that grant EXECUTE on new functions directly to anon and
-- authenticated (separately from the PUBLIC pseudo-role), so anon still had
-- it. Revoke directly from anon to actually close this off.

revoke execute on function public.wallet_top_up(numeric) from anon;
revoke execute on function public.wallet_withdraw(numeric) from anon;
revoke execute on function public.wallet_pay(numeric, bigint, text) from anon;
