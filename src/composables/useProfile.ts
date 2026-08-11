// Diet/allergy fields on `profiles` — see useAccount for the rest of that
// same row (name, email, phone, student id, university).
import { ref } from 'vue';
import { supabase } from '@/services/supabase';

export const dietOptions = ['No Preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Halal'];

export const allergyOptions = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy'];

const primaryDiet = ref('No Preference');
const allergies = ref<string[]>([]);
const loaded = ref(false);

async function fetchProfile() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('primary_diet, allergies')
    .eq('id', userData.user.id)
    .single();
  if (error || !data) return;

  primaryDiet.value = data.primary_diet;
  allergies.value = data.allergies;
  loaded.value = true;
}

/** Persists a single-select diet choice and updates local state to match. */
async function setPrimaryDiet(diet: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ primary_diet: diet, updated_at: new Date().toISOString() })
    .eq('id', userData.user.id);
  if (error) throw new Error(error.message);

  primaryDiet.value = diet;
}

/** Adds/removes one allergy from the multi-select list and persists the
 * resulting array in one write. */
async function toggleAllergy(allergy: string) {
  const next = allergies.value.includes(allergy)
    ? allergies.value.filter((a) => a !== allergy)
    : [...allergies.value, allergy];

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ allergies: next, updated_at: new Date().toISOString() })
    .eq('id', userData.user.id);
  if (error) throw new Error(error.message);

  allergies.value = next;
}

export function useProfile() {
  if (!loaded.value) fetchProfile();
  return { primaryDiet, allergies, setPrimaryDiet, toggleAllergy };
}
