-- pickup_slot has only ever been a free-text label (e.g. "12:00 – 12:15
-- PM") — fine for display, but not something that can be safely compared
-- against "now" to detect a missed pickup (locale-dependent parsing of a
-- formatted string is fragile). pickup_slot_end is the real, comparable
-- deadline: the end of the selected pickup window, computed client-side
-- from the same Date the label was formatted from.

alter table public.orders add column pickup_slot_end timestamptz;

drop function if exists public.place_order(bigint, text, text);

create function public.place_order(
  p_pickup_location_id bigint,
  p_pickup_slot text,
  p_pickup_slot_end timestamptz,
  p_payment_method text
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total numeric(10, 2);
  v_code text;
  v_order public.orders;
begin
  -- Step 1: identify the caller. Never trust a user_id passed in as a
  -- parameter — always take it from the session's own auth.uid(), so this
  -- function can only ever act on the caller's own cart/orders even though
  -- security definer gives it elevated privileges.
  if v_user_id is null then
    raise exception 'Not signed in';
  end if;

  -- Step 2: refuse to place an order for an empty cart.
  if not exists (select 1 from public.cart_items where user_id = v_user_id) then
    raise exception 'Cart is empty';
  end if;

  -- Step 3: compute the order total server-side from the cart_items rows
  -- that are actually in the database — not a number sent by the client.
  select coalesce(sum(qty * unit_price + extras_total_price), 0)
  into v_total
  from public.cart_items
  where user_id = v_user_id;

  -- Step 4: generate the pickup code shown at the counter (e.g. "482-17").
  v_code := (100 + floor(random() * 900))::int || '-' || (10 + floor(random() * 90))::int;

  -- Step 5: insert the order row itself, including the real pickup
  -- deadline alongside the display label.
  insert into public.orders
    (user_id, pickup_location_id, pickup_slot, pickup_slot_end, total, payment_method)
  values
    (v_user_id, p_pickup_location_id, p_pickup_slot, p_pickup_slot_end, v_total, p_payment_method)
  returning * into v_order;

  -- Step 6: snapshot every cart line into order_items against the new
  -- order id.
  insert into public.order_items (order_id, meal_id, name, qty, unit_price, summary, extras, extras_total_price)
  select
    v_order.id,
    ci.meal_id,
    case when ci.summary <> '' then ci.name || ' (' || ci.summary || ')' else ci.name end,
    ci.qty,
    ci.unit_price,
    ci.summary,
    array(select jsonb_array_elements_text(ci.extras)),
    ci.extras_total_price
  from public.cart_items ci
  where ci.user_id = v_user_id;

  -- Step 7: the order now owns this data — clear the cart.
  delete from public.cart_items where user_id = v_user_id;

  -- Step 8: hand the new order row back to the client.
  return v_order;
end;
$$;

grant execute on function public.place_order(bigint, text, timestamptz, text) to authenticated;
