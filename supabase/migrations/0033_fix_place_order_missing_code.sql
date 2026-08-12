-- Fixes a bug introduced in 0032: the orders insert's column list dropped
-- `code` while adding pickup_slot_end, so every order failed with
-- "null value in column code violates not-null constraint". Same function
-- body as 0032, just with `code` restored to the insert.

create or replace function public.place_order(
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
  if v_user_id is null then
    raise exception 'Not signed in';
  end if;

  if not exists (select 1 from public.cart_items where user_id = v_user_id) then
    raise exception 'Cart is empty';
  end if;

  select coalesce(sum(qty * unit_price + extras_total_price), 0)
  into v_total
  from public.cart_items
  where user_id = v_user_id;

  v_code := (100 + floor(random() * 900))::int || '-' || (10 + floor(random() * 90))::int;

  insert into public.orders
    (user_id, pickup_location_id, pickup_slot, pickup_slot_end, code, total, payment_method)
  values
    (v_user_id, p_pickup_location_id, p_pickup_slot, p_pickup_slot_end, v_code, v_total, p_payment_method)
  returning * into v_order;

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

  delete from public.cart_items where user_id = v_user_id;

  return v_order;
end;
$$;

grant execute on function public.place_order(bigint, text, timestamptz, text) to authenticated;
