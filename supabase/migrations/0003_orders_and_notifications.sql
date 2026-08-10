-- Orders, order items, and notifications, wired together by triggers so
-- status changes made anywhere (app, dashboard) always produce a notification.

create table public.orders (
  id bigint generated always as identity (start with 10484) primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'placed' check (status in ('placed', 'preparing', 'ready', 'completed', 'cancelled')),
  pickup_location_id text references public.pickup_locations (id),
  pickup_slot text not null,
  code text not null,
  total numeric(10, 2) not null,
  placed_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can place their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Client can only ever move a pending order to cancelled — every other
-- status transition happens from the Supabase dashboard with the service
-- role, which bypasses RLS entirely.
create policy "Users can cancel their own pending orders"
  on public.orders for update
  using (auth.uid() = user_id and status in ('placed', 'preparing'))
  with check (auth.uid() = user_id and status = 'cancelled');

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  meal_id bigint references public.meals (id),
  name text not null,
  qty int not null check (qty > 0),
  unit_price numeric(10, 2) not null,
  summary text not null default ''
);

alter table public.order_items enable row level security;

create policy "Users can view items of their own orders"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

create policy "Users can add items to their own orders"
  on public.order_items for insert
  with check (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('order', 'reward', 'menu', 'system')),
  title text not null,
  message text not null,
  action_route text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create function public.notify_order_placed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, action_route)
  values (
    new.user_id,
    'order',
    'Order #' || new.id || ' placed',
    'We''ll have it ready for pickup at ' || new.pickup_slot || '.',
    '/tabs/tab3'
  );
  return new;
end;
$$;

create trigger on_order_placed
  after insert on public.orders
  for each row execute function public.notify_order_placed();

create function public.notify_order_status_change()
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
    when 'completed' then
      notification_title := 'Order #' || new.id || ' completed';
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

create trigger on_order_status_change
  after update of status on public.orders
  for each row execute function public.notify_order_status_change();

-- Realtime: push order status changes and new notifications to subscribed clients.
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
