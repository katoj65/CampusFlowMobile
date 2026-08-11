<template>
  <ion-page>
    <ion-content :fullscreen="true" class="diet-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('profile.dietaryPreference') }}</h1>
      </div>

      <div class="page-body">
        <p class="intro">
          {{ $t('diet.intro') }}
        </p>

        <section class="detail-section">
          <h2>{{ $t('diet.primaryDiet') }}</h2>
          <div class="option-list">
            <button
              class="option-row"
              v-for="diet in dietOptions"
              :key="diet"
              :class="{ active: primaryDiet === diet }"
              @click="onSelectDiet(diet)"
            >
              <div class="option-icon" :style="{ background: dietMeta(diet).color + '1f', color: dietMeta(diet).color }">
                <ion-icon :icon="dietMeta(diet).icon" />
              </div>
              <span>{{ diet }}</span>
              <ion-icon :icon="primaryDiet === diet ? checkmarkCircle : ellipseOutline" class="check" />
            </button>
          </div>
        </section>

        <section class="detail-section">
          <h2>{{ $t('diet.allergiesIntolerances') }}</h2>
          <p class="section-hint">{{ $t('diet.selectAllThatApply') }}</p>
          <div class="option-list">
            <button
              class="option-row"
              v-for="allergy in allergyOptions"
              :key="allergy"
              :class="{ active: allergies.includes(allergy) }"
              @click="onToggleAllergy(allergy)"
            >
              <div class="option-icon warn-icon">
                <ion-icon :icon="alertCircleOutline" />
              </div>
              <span>{{ allergy }}</span>
              <ion-icon :icon="allergies.includes(allergy) ? checkmarkCircle : ellipseOutline" class="check" />
            </button>
          </div>
        </section>

        <p class="disclaimer">
          <ion-icon :icon="informationCircleOutline" />
          {{ $t('diet.crossContaminationDisclaimer') }}
        </p>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="1800"
        position="top"
        @didDismiss="showToast = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  checkmarkCircle,
  ellipseOutline,
  fastFoodOutline,
  leafOutline,
  fishOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useProfile, dietOptions, allergyOptions } from '@/composables/useProfile';

const router = useRouter();
const { t } = useI18n();
const { primaryDiet, allergies, setPrimaryDiet, toggleAllergy } = useProfile();

const showToast = ref(false);
const toastMessage = ref('');
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onSelectDiet(diet: string) {
  if (primaryDiet.value === diet) return;
  try {
    await setPrimaryDiet(diet);
  } catch {
    notify(t('diet.updateFailed'));
  }
}

async function onToggleAllergy(allergy: string) {
  try {
    await toggleAllergy(allergy);
  } catch {
    notify(t('diet.updateFailed'));
  }
}

const dietIconMeta: Record<string, { icon: string; color: string }> = {
  'No Preference': { icon: fastFoodOutline, color: '#94A3B8' },
  Vegetarian: { icon: leafOutline, color: '#2EC4B6' },
  Vegan: { icon: leafOutline, color: '#22A559' },
  Pescatarian: { icon: fishOutline, color: '#5B8DEF' },
  Halal: { icon: shieldCheckmarkOutline, color: '#8A5CF6' },
};

function dietMeta(diet: string) {
  return dietIconMeta[diet] ?? dietIconMeta['No Preference'];
}
</script>

<style scoped>
.diet-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.stack-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) 16px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-color-step-50, #f4f5f8);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 6px 16px -14px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.stack-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.page-body {
  padding: 4px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.detail-section h2 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
}

.section-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.option-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid transparent;
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.option-row.active {
  border-color: #ff6b35;
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.warn-icon {
  background: rgba(255, 159, 28, 0.16);
  color: #ff9f1c;
}

.option-row span {
  flex: 1;
}

.check {
  font-size: 20px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
}

.option-row.active .check {
  color: #ff6b35;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--ion-color-step-100, #ececec);
  font-size: 11px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.disclaimer ion-icon {
  font-size: 16px;
  margin-top: 1px;
  flex-shrink: 0;
}
</style>
