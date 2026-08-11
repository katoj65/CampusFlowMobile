-- 0009's column-level revoke didn't actually narrow anything: authenticated
-- still holds Supabase's default table-level UPDATE grant on
-- payment_methods, and a column-level REVOKE only removes a matching
-- column-level grant — it doesn't override a broader table-level one. The
-- only way to truly restrict which columns are writable is to revoke the
-- table-level privilege first, then grant back just the columns that
-- should be client-editable.

revoke update on public.payment_methods from authenticated;
grant update (label, detail, is_default) on public.payment_methods to authenticated;
