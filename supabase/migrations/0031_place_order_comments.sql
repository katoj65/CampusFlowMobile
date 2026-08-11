-- No behavior change from 0030 — same logic, with each step commented so
-- the checkout flow can be followed top to bottom.

create or replace function public.place_order(
  p_pickup_location_id bigint,
  p_pickup_slot text,
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
  -- Per line: qty * unit_price (the base item price, scaled by quantity)
  -- plus extras_total_price (the flat cost of selected extras for that
  -- line, charged once regardless of quantity). Summed across every line.
  select coalesce(sum(qty * unit_price + extras_total_price), 0)
  into v_total
  from public.cart_items
  where user_id = v_user_id;

  -- Step 4: generate the pickup code shown at the counter (e.g. "482-17").
  v_code := (100 + floor(random() * 900))::int || '-' || (10 + floor(random() * 90))::int;

  -- Step 5: insert the order row itself. status defaults to 'placed' and
  -- placed_at defaults to now() at the table level.
  insert into public.orders (user_id, pickup_location_id, pickup_slot, code, total, payment_method)
  values (v_user_id, p_pickup_location_id, p_pickup_slot, v_code, v_total, p_payment_method)
  returning * into v_order;

  -- Step 6: snapshot every cart line into order_items against the new
  -- order id. Extras (selected extra labels) are jsonb on cart_items but
  -- text[] on order_items, hence the jsonb_array_elements_text conversion.
  -- Names get the customization summary appended for a self-describing
  -- receipt line (e.g. "Pancakes (Large · Extra Cheese)").
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

  -- Step 7: the order now owns this data — clear the cart. Same
  -- transaction as steps 5-6, so a failure anywhere above rolls this back
  -- too instead of leaving the cart cleared with no order to show for it.
  delete from public.cart_items where user_id = v_user_id;

  -- Step 8: hand the new order row back to the client so it can show the
  -- confirmation screen immediately without a second round trip.
  return v_order;
end;
$$;

grant execute on function public.place_order(bigint, text, text) to authenticated;
