-- Configurable order-cancellation policy: how many minutes after placing an
-- order a student may still cancel it. Enforced here in RLS (the source of
-- truth) and mirrored client-side so the Cancel button doesn't linger once
-- the window has closed.

create table public.order_cancellation (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  minutes int not null,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

alter table public.order_cancellation enable row level security;

create policy "Cancellation policy is publicly readable"
  on public.order_cancellation for select
  to anon, authenticated
  using (true);

insert into public.order_cancellation (title, description, minutes, status) values
  (
    'Standard Cancellation Window',
    'Students may cancel an order within this many minutes of placing it. After the window closes, the order can no longer be cancelled from the app.',
    30,
    'active'
  );

-- Replace the existing cancel policy so it also requires the order to still
-- be within the active cancellation window (falls back to 30 minutes if no
-- active policy row exists, so cancellation fails closed rather than open).
drop policy "Users can cancel their own pending orders" on public.orders;

create policy "Users can cancel their own pending orders within the window"
  on public.orders for update
  using (
    auth.uid() = user_id
    and status in ('placed', 'preparing')
    and placed_at > now() - (
      coalesce(
        (select minutes from public.order_cancellation where status = 'active' order by id desc limit 1),
        30
      ) * interval '1 minute'
    )
  )
  with check (auth.uid() = user_id and status = 'cancelled');
