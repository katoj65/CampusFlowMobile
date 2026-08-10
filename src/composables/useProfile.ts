import { ref } from 'vue';

export const dietOptions = ['No Preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Halal'];

export const allergyOptions = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy'];

const primaryDiet = ref('Vegetarian');
const allergies = ref<string[]>([]);

function setPrimaryDiet(diet: string) {
  primaryDiet.value = diet;
}

function toggleAllergy(allergy: string) {
  const index = allergies.value.indexOf(allergy);
  if (index === -1) {
    allergies.value = [...allergies.value, allergy];
  } else {
    allergies.value = allergies.value.filter((a) => a !== allergy);
  }
}

export function useProfile() {
  return { primaryDiet, allergies, setPrimaryDiet, toggleAllergy };
}
