-- cart_items was never added to the realtime publication when it was
-- created in 0012, so client-side subscriptions on it would silently do
-- nothing. Enable it, same as orders/notifications.
alter publication supabase_realtime add table public.cart_items;
