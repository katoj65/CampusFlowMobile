-- Rename the 'completed' order status to 'picked_up' — the UI copy
-- (orders.stepPickedUp, "Head to your pickup location...") already talked
-- about pickup, so the status value should say the same thing.

alter table public.orders drop constraint orders_status_check;

update public.orders set status = 'picked_up' where status = 'completed';

alter table public.orders
  add constraint orders_status_check
  check (status in ('placed', 'preparing', 'ready', 'picked_up', 'cancelled'));

create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  notification_title text;
  notification_message text;
begin
  if new.status = old.status then
    return new;
  end if;

  case new.status
    when 'preparing' then
      notification_title := 'Order #' || new.id || ' is preparing';
      notification_message := 'We''re getting your order ready.';
    when 'ready' then
      notification_title := 'Order #' || new.id || ' is ready for pickup';
      notification_message := 'Head to your pickup location to collect it.';
    when 'picked_up' then
      notification_title := 'Order #' || new.id || ' picked up';
      notification_message := 'Thanks for picking up on time — see you again soon!';
    when 'cancelled' then
      notification_title := 'Order #' || new.id || ' cancelled';
      notification_message := 'Your pickup slot has been released.';
    else
      return new;
  end case;

  insert into public.notifications (user_id, type, title, message, action_route)
  values (new.user_id, 'order', notification_title, notification_message, '/tabs/tab3');

  return new;
end;
$$;
