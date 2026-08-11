// The student's per-day meal picks (`weekly_meal_plan`) plus their
// preferred order time — Tab1's "Today's Nutrition" card reads this to
// show today's planned meal.
import { reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface DayPlan {
  dayOfWeek: number; // 1 = Monday .. 7 = Sunday
  mealId: number | null;
}

const days = reactive<DayPlan[]>([1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({ dayOfWeek, mealId: null })));
const orderTime = ref('10:00');
const loaded = ref(false);
const loading = ref(false);

/** Loads the 7-day plan and preferred order time in parallel, then merges
 * the fetched picks onto the fixed Mon-Sun `days` array (a day with no row
 * yet just keeps its default mealId: null). */
async function fetchPlan() {
  loading.value = true;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const [{ data: profile }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('weekly_order_time').eq('id', userData.user.id).single(),
      supabase.from('weekly_meal_plan').select('day_of_week, meal_id').eq('user_id', userData.user.id),
    ]);

    if (profile) orderTime.value = profile.weekly_order_time.slice(0, 5);
    for (const day of days) {
      day.mealId = rows?.find((r) => r.day_of_week === day.dayOfWeek)?.meal_id ?? null;
    }
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

/** Persists every day + the order time in one batch, then updates local state. */
async function savePlan(entries: DayPlan[], time: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not signed in');
  const userId = userData.user.id;

  // Step 1: split into days with a meal picked (upsert) vs. days cleared
  // back to "no meal" (delete) — weekly_meal_plan has no row for a day
  // with nothing planned, so clearing a day means removing its row.
  const toUpsert = entries
    .filter((e): e is DayPlan & { mealId: number } => e.mealId !== null)
    .map((e) => ({ user_id: userId, day_of_week: e.dayOfWeek, meal_id: e.mealId, updated_at: new Date().toISOString() }));
  const toClearDays = entries.filter((e) => e.mealId === null).map((e) => e.dayOfWeek);

  // Step 2: run every write in parallel — upsert, delete, and the order
  // time update on `profiles` don't depend on each other.
  const tasks = [];
  if (toUpsert.length > 0) {
    tasks.push(supabase.from('weekly_meal_plan').upsert(toUpsert, { onConflict: 'user_id,day_of_week' }));
  }
  if (toClearDays.length > 0) {
    tasks.push(supabase.from('weekly_meal_plan').delete().eq('user_id', userId).in('day_of_week', toClearDays));
  }
  tasks.push(
    supabase
      .from('profiles')
      .update({ weekly_order_time: `${time}:00`, updated_at: new Date().toISOString() })
      .eq('id', userId)
  );

  const results = await Promise.all(tasks);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  // Step 3: only reflect the change locally after every write succeeded.
  for (const day of days) {
    const entry = entries.find((e) => e.dayOfWeek === day.dayOfWeek);
    day.mealId = entry?.mealId ?? null;
  }
  orderTime.value = time;
}

export function useWeeklyMealPlan() {
  if (!loaded.value) fetchPlan();
  return { days, orderTime, loading, loaded, savePlan, fetchPlan };
}
