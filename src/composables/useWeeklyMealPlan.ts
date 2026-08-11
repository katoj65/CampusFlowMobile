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

  const toUpsert = entries
    .filter((e): e is DayPlan & { mealId: number } => e.mealId !== null)
    .map((e) => ({ user_id: userId, day_of_week: e.dayOfWeek, meal_id: e.mealId, updated_at: new Date().toISOString() }));
  const toClearDays = entries.filter((e) => e.mealId === null).map((e) => e.dayOfWeek);

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
