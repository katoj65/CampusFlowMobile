

import {
  fastFoodOutline,
  sunnyOutline,
  restaurantOutline,
  leafOutline,
  flameOutline,
  cafeOutline,
  iceCreamOutline,
} from 'ionicons/icons';

export interface MealItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: number;
  tags: string[];
  calories: number;
  available: number;
  ingredients: string[];
  customizable: boolean;
}

export interface Category {
  id: number;
  label: string;
  icon: string;
}

export interface PriceOption {
  id: string;
  label: string;
  priceDelta: number;
}

/** Mirrors supabase/migrations/0018_categories_numeric_id.sql — ids are
 * system-generated identity values, in the same order as that seed. */
export const CATEGORY_ALL = 1;
export const CATEGORY_BREAKFAST = 2;
export const CATEGORY_MAINS = 3;
export const CATEGORY_SALADS = 4;
export const CATEGORY_GRILL = 5;
export const CATEGORY_DRINKS = 6;
export const CATEGORY_DESSERTS = 7;

export const categories: Category[] = [
  { id: CATEGORY_ALL, label: 'All', icon: fastFoodOutline },
  { id: CATEGORY_BREAKFAST, label: 'Breakfast', icon: sunnyOutline },
  { id: CATEGORY_MAINS, label: 'Mains', icon: restaurantOutline },
  { id: CATEGORY_SALADS, label: 'Salads & Bowls', icon: leafOutline },
  { id: CATEGORY_GRILL, label: 'Grill', icon: flameOutline },
  { id: CATEGORY_DRINKS, label: 'Drinks', icon: cafeOutline },
  { id: CATEGORY_DESSERTS, label: 'Desserts', icon: iceCreamOutline },
];

export const sizeOptions: PriceOption[] = [
  { id: 'regular', label: 'Regular', priceDelta: 0 },
  { id: 'large', label: 'Large', priceDelta: 1.2 },
];

export const spiceLevels = ['Mild', 'Medium', 'Hot'];

export const commonExtras: PriceOption[] = [
  { id: 'extra-sauce', label: 'Extra Sauce', priceDelta: 0.5 },
  { id: 'extra-cheese', label: 'Extra Cheese', priceDelta: 0.7 },
  { id: 'side-bread', label: 'Side of Bread', priceDelta: 0.9 },
];

export const meals: MealItem[] = [
  {
    id: 1,
    name: 'Fluffy Pancake Stack',
    description: 'Stacked buttermilk pancakes served warm with maple syrup and a pat of butter.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop',
    price: 3.2,
    category: CATEGORY_BREAKFAST,
    tags: ['Vegetarian'],
    calories: 480,
    available: 14,
    ingredients: ['Buttermilk pancakes', 'Maple syrup', 'Butter', 'Icing sugar'],
    customizable: true,
  },
  {
    id: 2,
    name: 'Overnight Oats & Berries',
    description: 'Creamy oats soaked overnight with oat milk and chia, topped with fresh mixed berries.',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=80&auto=format&fit=crop',
    price: 2.6,
    category: CATEGORY_BREAKFAST,
    tags: ['Vegan', 'High-fibre'],
    calories: 340,
    available: 4,
    ingredients: ['Rolled oats', 'Chia seeds', 'Oat milk', 'Mixed berries', 'Honey'],
    customizable: true,
  },
  {
    id: 3,
    name: 'Grilled Chicken & Herb Rice Bowl',
    description: 'Grilled chicken breast, herbed rice, roasted vegetables and tzatziki.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
    price: 4.8,
    category: CATEGORY_MAINS,
    tags: ['High-protein'],
    calories: 620,
    available: 18,
    ingredients: ['Grilled chicken breast', 'Herbed basmati rice', 'Roasted courgette', 'Roasted peppers', 'Tzatziki sauce'],
    customizable: true,
  },
  {
    id: 4,
    name: 'Butter Chicken Curry',
    description: 'Tender chicken simmered in a rich, creamy tomato curry sauce, served with rice.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop',
    price: 4.5,
    category: CATEGORY_MAINS,
    tags: ['Spicy'],
    calories: 590,
    available: 9,
    ingredients: ['Chicken thigh', 'Tomato curry sauce', 'Cream', 'Basmati rice', 'Coriander'],
    customizable: true,
  },
  {
    id: 5,
    name: 'Pasta Primavera',
    description: 'Penne pasta tossed with seasonal vegetables in a light garlic olive oil sauce.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format&fit=crop',
    price: 4.2,
    category: CATEGORY_MAINS,
    tags: ['Vegetarian'],
    calories: 560,
    available: 3,
    ingredients: ['Penne pasta', 'Cherry tomatoes', 'Courgette', 'Bell peppers', 'Garlic olive oil', 'Parmesan'],
    customizable: true,
  },
  {
    id: 6,
    name: 'Classic Beef Burger',
    description: 'Grilled beef patty with cheddar, lettuce, tomato and house sauce in a brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop',
    price: 5.1,
    category: CATEGORY_GRILL,
    tags: ['High-protein'],
    calories: 710,
    available: 11,
    ingredients: ['Beef patty', 'Brioche bun', 'Cheddar cheese', 'Lettuce', 'Tomato', 'House sauce'],
    customizable: true,
  },
  {
    id: 7,
    name: 'Grilled Chicken Skewers',
    description: 'Marinated chicken skewers grilled over open flame, served with a herb yoghurt dip.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop',
    price: 4.9,
    category: CATEGORY_GRILL,
    tags: ['High-protein'],
    calories: 540,
    available: 6,
    ingredients: ['Marinated chicken breast', 'Bell peppers', 'Red onion', 'Herb yoghurt dip'],
    customizable: true,
  },
  {
    id: 8,
    name: 'Buddha Bowl',
    description: 'Quinoa, roasted chickpeas, avocado and seasonal vegetables with a tahini dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
    price: 3.9,
    category: CATEGORY_SALADS,
    tags: ['Vegetarian', 'High-fibre'],
    calories: 430,
    available: 16,
    ingredients: ['Quinoa', 'Roasted chickpeas', 'Avocado', 'Cherry tomatoes', 'Red cabbage', 'Tahini dressing'],
    customizable: true,
  },
  {
    id: 9,
    name: 'Garden Fresh Salad',
    description: 'Crisp mixed greens with cucumber, tomato, olives and a light vinaigrette.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&auto=format&fit=crop',
    price: 3.2,
    category: CATEGORY_SALADS,
    tags: ['Vegan', 'Low-cal'],
    calories: 260,
    available: 2,
    ingredients: ['Mixed greens', 'Cucumber', 'Cherry tomatoes', 'Kalamata olives', 'Vinaigrette'],
    customizable: true,
  },
  {
    id: 10,
    name: 'Mango Berry Smoothie',
    description: 'Blended mango, mixed berries and yoghurt — a refreshing energy boost.',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&q=80&auto=format&fit=crop',
    price: 2.8,
    category: CATEGORY_DRINKS,
    tags: ['Vegan'],
    calories: 210,
    available: 20,
    ingredients: ['Mango', 'Mixed berries', 'Greek yoghurt', 'Honey'],
    customizable: false,
  },
  {
    id: 11,
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice with a splash of milk.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop',
    price: 2.1,
    category: CATEGORY_DRINKS,
    tags: ['Vegetarian'],
    calories: 90,
    available: 25,
    ingredients: ['Cold brew coffee', 'Ice', 'Milk'],
    customizable: false,
  },
  {
    id: 12,
    name: 'Chocolate Fudge Cake',
    description: 'Rich, moist chocolate cake layered with fudge frosting.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop',
    price: 2.9,
    category: CATEGORY_DESSERTS,
    tags: ['Vegetarian'],
    calories: 390,
    available: 5,
    ingredients: ['Cocoa sponge', 'Fudge frosting', 'Dark chocolate shavings'],
    customizable: false,
  },
  {
    id: 13,
    name: 'Fresh Fruit Cup',
    description: 'A refreshing mix of seasonal fresh fruit, chilled and ready to go.',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80&auto=format&fit=crop',
    price: 2.2,
    category: CATEGORY_DESSERTS,
    tags: ['Vegan', 'Low-cal'],
    calories: 140,
    available: 12,
    ingredients: ['Watermelon', 'Pineapple', 'Grapes', 'Mint'],
    customizable: false,
  },
];

export function findMeal(id: number): MealItem | undefined {
  return meals.find((meal) => meal.id === id);
}
