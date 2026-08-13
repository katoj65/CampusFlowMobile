// Adverts (`adverts`, owned by a separate admin-panel project — see
// supabase/migrations/0045_adverts.sql for the student-read policy this
// repo adds on top of it) plus the student's own show/hide preference
// (profiles.advert_status, 0046_profiles_advert_status.sql).
import { computed, reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface AdvertMeal {
  id: number;
  name: string;
  image: string;
  price: number;
}

export interface Advert {
  id: number;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  status: 'draft' | 'active' | 'expired';
  meal: AdvertMeal | null;
}

const latestAdvert = ref<Advert | null>(null);
const adverts = reactive<Advert[]>([]);
const advertStatus = ref<'shown' | 'hidden'>('shown');
const advertsEnabled = computed(() => advertStatus.value === 'shown');

const loaded = ref(false);
const listLoaded = ref(false);
const loading = ref(false);
const listLoading = ref(false);

async function getOwnUniversityId(): Promise<number | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('university_id')
    .eq('id', userData.user.id)
    .single();
  return profile?.university_id ?? null;
}

async function fetchMealFor(menuId: number | null): Promise<AdvertMeal | null> {
  if (!menuId) return null;
  const { data } = await supabase.from('meals').select('id, name, image_url, price').eq('id', menuId).maybeSingle();
  return data ? { id: data.id, name: data.name, image: data.image_url, price: data.price } : null;
}

function mapAdvert(
  row: { id: number; title: string; description: string | null; from_date: string; to_date: string; status: 'draft' | 'active' | 'expired' },
  meal: AdvertMeal | null
): Advert {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    fromDate: row.from_date,
    toDate: row.to_date,
    status: row.status,
    meal,
  };
}

/** Loads the signed-in student's show/hide preference for the hero advert. */
async function fetchAdvertPreference() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { data } = await supabase.from('profiles').select('advert_status').eq('id', userData.user.id).single();
  if (data) advertStatus.value = data.advert_status;
}

/** Persists the show/hide preference and updates local state immediately. */
async function setAdvertsEnabled(enabled: boolean) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const next = enabled ? 'shown' : 'hidden';
  const previous = advertStatus.value;
  advertStatus.value = next;

  const { error } = await supabase.from('profiles').update({ advert_status: next }).eq('id', userData.user.id);
  if (error) {
    advertStatus.value = previous;
    throw new Error(error.message);
  }
}

/** Fetches the single most recent advert that's active and currently
 * within its date range — not just the newest row overall, since a
 * freshly-created but not-yet-started or already-expired campaign
 * shouldn't show in the hero. */
async function fetchLatestAdvert() {
  loading.value = true;
  try {
    await fetchAdvertPreference();
    const universityId = await getOwnUniversityId();
    if (!universityId) return;

    const today = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabase
      .from('adverts')
      .select('id, title, description, from_date, to_date, status, menu_id')
      .eq('university_id', universityId)
      .eq('status', 'active')
      .lte('from_date', today)
      .gte('to_date', today)
      .order('from_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    latestAdvert.value = row ? mapAdvert(row, await fetchMealFor(row.menu_id)) : null;
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

/** Fetches every advert for the student's own university (any status,
 * any date range) for the Adverts list page. */
async function fetchAllAdverts() {
  listLoading.value = true;
  try {
    const universityId = await getOwnUniversityId();
    if (!universityId) return;

    const { data: rows } = await supabase
      .from('adverts')
      .select('id, title, description, from_date, to_date, status, menu_id')
      .eq('university_id', universityId)
      .order('from_date', { ascending: false });

    const mapped: Advert[] = [];
    for (const row of rows ?? []) {
      mapped.push(mapAdvert(row, await fetchMealFor(row.menu_id)));
    }
    adverts.splice(0, adverts.length, ...mapped);
    listLoaded.value = true;
  } finally {
    listLoading.value = false;
  }
}

export function useAdverts() {
  if (!loaded.value) fetchLatestAdvert();
  return {
    latestAdvert,
    adverts,
    advertsEnabled,
    loading,
    listLoading,
    listLoaded,
    setAdvertsEnabled,
    fetchLatestAdvert,
    fetchAllAdverts,
  };
}
