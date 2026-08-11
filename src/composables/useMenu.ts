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
import type { MealItem, Category } from '@/data/menu';

const meals = reactive<MealItem[]>([]);
const categories = reactive<Category[]>([]);
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

/** Meals are strictly scoped to the student's own university — no
 * cross-university browsing and no fallback to the full catalog. */
async function fetchMenu() {
  loading.value = true;
  try {
    const { data: categoryRows } = await supabase.from('categories').select('*').order('id');
    const mappedCategories: Category[] = (categoryRows ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      icon: ICONS[row.icon] ?? fastFoodOutline,
    }));
    categories.splice(0, categories.length, ...mappedCategories);

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

    const mealRows = universityId ? await fetchMealsFor(universityId) : [];

    meals.splice(0, meals.length, ...mealRows);
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

async function fetchMealsFor(universityId: number) {
  const { data } = await supabase.from('meals').select('*').eq('university_id', universityId).order('id');
  return (data ?? []).map(mapMeal);
}

function findMeal(id: number): MealItem | undefined {
  return meals.find((meal) => meal.id === id);
}

export function useMenu() {
  if (!loaded.value) fetchMenu();
  return { meals, categories, loading, findMeal, fetchMenu };
}
