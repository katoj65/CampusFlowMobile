// Public read-only reference data (`universities` table) — the list a
// student can pick from on Account Details.
import { reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface University {
  id: number;
  name: string;
  city: string;
  country: string;
}

const universities = reactive<University[]>([]);
const loaded = ref(false);
const loading = ref(false);

async function fetchUniversities() {
  loading.value = true;
  try {
    const { data } = await supabase.from('universities').select('id, name, city, country').order('id');
    universities.splice(0, universities.length, ...(data ?? []));
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

export function useUniversities() {
  if (!loaded.value) fetchUniversities();
  return { universities, loading, fetchUniversities };
}
