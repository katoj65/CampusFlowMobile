// Catalog data (categories, meals, extras) scoped to the student's own
// university — see fetchMenu()'s doc comment for the RLS rationale.
import { reactive, ref } from 'vue';
import {
  fastFoodOutline,
  sunnyOutline,
  restaurantOutline,
  leafOutline,
  flameOutline,
  cafeOutline,
  iceCreamOutline,
} from 'ionicons/icons';
import { supabase } from '@/services/supabase';
import type { MealItem, Category, PriceOption } from '@/data/menu';

const meals = reactive<MealItem[]>([]);
const categories = reactive<Category[]>([]);
const extras = reactive<PriceOption[]>([]);
const loaded = ref(false);
const loading = ref(false);

/** categories.icon in the DB is a plain kebab-case name (e.g. "flame-outline").
 * ion-icon can't resolve that to a bundled asset on its own — it needs the
 * actual imported icon reference, same as every other :icon usage in the app. */
const ICONS: Record<string, string> = {
  'fast-food-outline': fastFoodOutline,
  'sunny-outline': sunnyOutline,
  'restaurant-outline': restaurantOutline,
  'leaf-outline': leafOutline,
  'flame-outline': flameOutline,
  'cafe-outline': cafeOutline,
  'ice-cream-outline': iceCreamOutline,
};

/** Maps a `meals` row (snake_case DB columns) onto the MealItem shape the
 * UI uses everywhere (camelCase, `image` instead of `image_url`, etc). */
function mapMeal(row: {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category_id: number;
  tags: string[];
  calories: number;
  available: number;
  ingredients: string[];
  customizable: boolean;
}): MealItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image_url,
    price: row.price,
    category: row.category_id,
    tags: row.tags,
    calories: row.calories,
    available: row.available,
    ingredients: row.ingredients,
    customizable: row.customizable,
  };
}

/** Loads categories, meals, and extras. Meals and extras are strictly
 * scoped to the student's own university — no cross-university browsing
 * and no fallback to the full catalog if the university lookup fails. */
async function fetchMenu() {
  loading.value = true;
  try {
    // Step 1: categories are global/shared across universities.
    const { data: categoryRows } = await supabase.from('categories').select('*').order('id');
    const mappedCategories: Category[] = (categoryRows ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      icon: ICONS[row.icon] ?? fastFoodOutline,
    }));
    categories.splice(0, categories.length, ...mappedCategories);

    // Step 2: resolve the student's own university before touching
    // anything university-scoped — meals/extras stay empty without one.
    let universityId: number | null = null;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', userData.user.id)
        .single();
      universityId = profile?.university_id ?? null;
    }

    // Step 3: fetch meals and extras for that university in parallel.
    const [mealRows, extraRows] = await Promise.all([
      universityId ? fetchMealsFor(universityId) : Promise.resolve([]),
      universityId ? fetchExtrasFor(universityId) : Promise.resolve([]),
    ]);

    meals.splice(0, meals.length, ...mealRows);
    extras.splice(0, extras.length, ...extraRows);
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

async function fetchMealsFor(universityId: number) {
  const { data } = await supabase.from('meals').select('*').eq('university_id', universityId).order('id');
  return (data ?? []).map(mapMeal);
}

async function fetchExtrasFor(universityId: number): Promise<PriceOption[]> {
  const { data } = await supabase.from('meal_extras').select('*').eq('university_id', universityId).order('id');
  return (data ?? []).map((row) => ({ id: String(row.id), label: row.label, priceDelta: row.price_delta }));
}

/** Looks up a meal from the already-fetched `meals` cache — does not hit
 * the network, so callers should ensure fetchMenu() has run first. */
function findMeal(id: number): MealItem | undefined {
  return meals.find((meal) => meal.id === id);
}

export function useMenu() {
  if (!loaded.value) fetchMenu();
  return { meals, categories, extras, loading, findMeal, fetchMenu };
}
