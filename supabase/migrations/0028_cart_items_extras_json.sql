-- cart_items.extras becomes jsonb instead of text[] (order_items.extras is
-- unaffected — it's populated from the cart line at checkout either way).

alter table public.cart_items
  alter column extras drop default,
  alter column extras type jsonb using to_jsonb(extras),
  alter column extras set default '[]'::jsonb;
