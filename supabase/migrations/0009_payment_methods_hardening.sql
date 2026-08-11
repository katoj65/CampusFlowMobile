-- payment_methods is about to get real client-side CRUD (usePaymentMethods
-- was mock-only until now). The existing "for all" policy from 0001 would
-- let a client delete or repurpose the non-removable wallet/cash rows the
-- signup trigger creates — split it into per-action policies and lock the
-- integrity columns down at the grant level too.

drop policy "Users can manage their own payment methods" on public.payment_methods;

create policy "Users can view their own payment methods"
  on public.payment_methods for select
  using (auth.uid() = user_id);

create policy "Users can add their own payment methods"
  on public.payment_methods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payment methods"
  on public.payment_methods for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can remove their own removable payment methods"
  on public.payment_methods for delete
  using (auth.uid() = user_id and removable = true);

-- Without this, a client could flip removable=true on the wallet/cash rows
-- via a plain update() and then delete them under the policy above.
revoke update (type, removable, user_id) on public.payment_methods from authenticated;
