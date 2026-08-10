-- Public read-only reference data: categories, meals, pickup locations.
-- No client write policies — managed via the Supabase dashboard (service role bypasses RLS).

create table public.categories (
  id text primary key,
  label text not null,
  icon text not null
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

create table public.meals (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null,
  image_url text not null,
  price numeric(10, 2) not null,
  category_id text not null references public.categories (id),
  tags text[] not null default '{}',
  calories int not null,
  available int not null default 0,
  ingredients text[] not null default '{}',
  customizable boolean not null default false
);

alter table public.meals enable row level security;

create policy "Meals are publicly readable"
  on public.meals for select
  to anon, authenticated
  using (true);

create table public.pickup_locations (
  id text primary key,
  name text not null,
  building text not null,
  walk_time text not null,
  hours text not null
);

alter table public.pickup_locations enable row level security;

create policy "Pickup locations are publicly readable"
  on public.pickup_locations for select
  to anon, authenticated
  using (true);

-- Seed data (mirrors the previous src/data/menu.ts and usePickupLocation.ts mocks).

insert into public.categories (id, label, icon) values
  ('all', 'All', 'fast-food-outline'),
  ('breakfast', 'Breakfast', 'sunny-outline'),
  ('mains', 'Mains', 'restaurant-outline'),
  ('salads', 'Salads & Bowls', 'leaf-outline'),
  ('grill', 'Grill', 'flame-outline'),
  ('drinks', 'Drinks', 'cafe-outline'),
  ('desserts', 'Desserts', 'ice-cream-outline');

insert into public.meals
  (name, description, image_url, price, category_id, tags, calories, available, ingredients, customizable)
values
  ('Fluffy Pancake Stack', 'Stacked buttermilk pancakes served warm with maple syrup and a pat of butter.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop', 3.2, 'breakfast', array['Vegetarian'], 480, 14, array['Buttermilk pancakes', 'Maple syrup', 'Butter', 'Icing sugar'], true),
  ('Overnight Oats & Berries', 'Creamy oats soaked overnight with oat milk and chia, topped with fresh mixed berries.', 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=80&auto=format&fit=crop', 2.6, 'breakfast', array['Vegan', 'High-fibre'], 340, 4, array['Rolled oats', 'Chia seeds', 'Oat milk', 'Mixed berries', 'Honey'], true),
  ('Grilled Chicken & Herb Rice Bowl', 'Grilled chicken breast, herbed rice, roasted vegetables and tzatziki.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop', 4.8, 'mains', array['High-protein'], 620, 18, array['Grilled chicken breast', 'Herbed basmati rice', 'Roasted courgette', 'Roasted peppers', 'Tzatziki sauce'], true),
  ('Butter Chicken Curry', 'Tender chicken simmered in a rich, creamy tomato curry sauce, served with rice.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop', 4.5, 'mains', array['Spicy'], 590, 9, array['Chicken thigh', 'Tomato curry sauce', 'Cream', 'Basmati rice', 'Coriander'], true),
  ('Pasta Primavera', 'Penne pasta tossed with seasonal vegetables in a light garlic olive oil sauce.', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format&fit=crop', 4.2, 'mains', array['Vegetarian'], 560, 3, array['Penne pasta', 'Cherry tomatoes', 'Courgette', 'Bell peppers', 'Garlic olive oil', 'Parmesan'], true),
  ('Classic Beef Burger', 'Grilled beef patty with cheddar, lettuce, tomato and house sauce in a brioche bun.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop', 5.1, 'grill', array['High-protein'], 710, 11, array['Beef patty', 'Brioche bun', 'Cheddar cheese', 'Lettuce', 'Tomato', 'House sauce'], true),
  ('Grilled Chicken Skewers', 'Marinated chicken skewers grilled over open flame, served with a herb yoghurt dip.', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop', 4.9, 'grill', array['High-protein'], 540, 6, array['Marinated chicken breast', 'Bell peppers', 'Red onion', 'Herb yoghurt dip'], true),
  ('Buddha Bowl', 'Quinoa, roasted chickpeas, avocado and seasonal vegetables with a tahini dressing.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop', 3.9, 'salads', array['Vegetarian', 'High-fibre'], 430, 16, array['Quinoa', 'Roasted chickpeas', 'Avocado', 'Cherry tomatoes', 'Red cabbage', 'Tahini dressing'], true),
  ('Garden Fresh Salad', 'Crisp mixed greens with cucumber, tomato, olives and a light vinaigrette.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&auto=format&fit=crop', 3.2, 'salads', array['Vegan', 'Low-cal'], 260, 2, array['Mixed greens', 'Cucumber', 'Cherry tomatoes', 'Kalamata olives', 'Vinaigrette'], true),
  ('Mango Berry Smoothie', 'Blended mango, mixed berries and yoghurt — a refreshing energy boost.', 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&q=80&auto=format&fit=crop', 2.8, 'drinks', array['Vegan'], 210, 20, array['Mango', 'Mixed berries', 'Greek yoghurt', 'Honey'], false),
  ('Iced Coffee', 'Cold brew coffee served over ice with a splash of milk.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop', 2.1, 'drinks', array['Vegetarian'], 90, 25, array['Cold brew coffee', 'Ice', 'Milk'], false),
  ('Chocolate Fudge Cake', 'Rich, moist chocolate cake layered with fudge frosting.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop', 2.9, 'desserts', array['Vegetarian'], 390, 5, array['Cocoa sponge', 'Fudge frosting', 'Dark chocolate shavings'], false),
  ('Fresh Fruit Cup', 'A refreshing mix of seasonal fresh fruit, chilled and ready to go.', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80&auto=format&fit=crop', 2.2, 'desserts', array['Vegan', 'Low-cal'], 140, 12, array['Watermelon', 'Pineapple', 'Grapes', 'Mint'], false);

insert into public.pickup_locations (id, name, building, walk_time, hours) values
  ('mensa-c2', 'Mensa Ground Floor, Counter 2', 'Main Mensa', '2 min', '11:00 – 20:00'),
  ('mensa-c1', 'Mensa Ground Floor, Counter 1', 'Main Mensa', '2 min', '11:00 – 20:00'),
  ('library-cafe', 'Library Café', 'Central Library', '6 min', '08:00 – 18:00'),
  ('engineering-kiosk', 'Engineering Building Kiosk', 'Building C', '9 min', '09:00 – 16:00');
