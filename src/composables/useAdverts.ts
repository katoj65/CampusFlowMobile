// The single latest active advert for the student's own university
// (`adverts`, owned by a separate admin-panel project — see
// supabase/migrations/0045_adverts.sql for the student-read policy this
// repo adds on top of it). Optionally linked to a meal via menu_id, whose
// image/price the hero banner uses when present.
import { ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface Advert {
  id: number;
  title: string;
  description: string;
  meal: { id: number; name: string; image: string; price: number } | null;
}

const latestAdvert = ref<Advert | null>(null);
const loaded = ref(false);
const loading = ref(false);

/** Fetches the student's own university, then the single most recent
 * advert that's active and currently within its date range — not just
 * the newest row overall, since a freshly-created but not-yet-started or
 * already-expired campaign shouldn't show. */
async function fetchLatestAdvert() {
  loading.value = true;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', userData.user.id)
      .single();
    if (!profile?.university_id) return;

    const today = new Date().toISOString().slice(0, 10);
    const { data: advert } = await supabase
      .from('adverts')
      .select('id, title, description, menu_id')
      .eq('university_id', profile.university_id)
      .eq('status', 'active')
      .lte('from_date', today)
      .gte('to_date', today)
      .order('from_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!advert) {
      latestAdvert.value = null;
      loaded.value = true;
      return;
    }

    let meal: Advert['meal'] = null;
    if (advert.menu_id) {
      const { data: mealRow } = await supabase
        .from('meals')
        .select('id, name, image_url, price')
        .eq('id', advert.menu_id)
        .maybeSingle();
      if (mealRow) meal = { id: mealRow.id, name: mealRow.name, image: mealRow.image_url, price: mealRow.price };
    }

    latestAdvert.value = { id: advert.id, title: advert.title, description: advert.description ?? '', meal };
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

export function useAdverts() {
  if (!loaded.value) fetchLatestAdvert();
  return { latestAdvert, loading, fetchLatestAdvert };
}
