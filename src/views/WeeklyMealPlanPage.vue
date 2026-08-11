<template>
  <ion-page>
    <ion-content :fullscreen="true" class="plan-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('weeklyPlan.title') }}</h1>
      </div>

      <div class="page-body">
        <p class="intro">{{ $t('weeklyPlan.intro') }}</p>

        <section class="detail-section">
          <h2>
            <ion-icon :icon="timeOutline" />
            {{ $t('weeklyPlan.orderTime') }}
          </h2>
          <p class="section-hint">{{ $t('weeklyPlan.orderTimeHint') }}</p>
          <input v-model="draftTime" type="time" class="time-input" />
        </section>

        <section class="detail-section">
          <h2>
            <ion-icon :icon="calendarOutline" />
            {{ $t('weeklyPlan.days') }}
          </h2>
          <div class="panel-card day-list">
            <div class="day-row" v-for="day in draftDays" :key="day.dayOfWeek">
              <span class="day-label">{{ $t(`weeklyPlan.day.${dayKey(day.dayOfWeek)}`) }}</span>
              <select class="meal-select" v-model="day.mealId">
                <option :value="null">{{ $t('weeklyPlan.noMeal') }}</option>
                <option v-for="meal in meals" :key="meal.id" :value="meal.id">{{ meal.name }}</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div class="save-footer">
        <button class="save-btn" :disabled="!isDirty || saving" @click="onSave">
          <ion-spinner v-if="saving" name="crescent" />
          <span v-else>{{ isDirty ? $t('weeklyPlan.savePlan') : $t('weeklyPlan.saved') }}</span>
        </button>
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
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast, IonSpinner } from '@ionic/vue';
import { chevronBackOutline, timeOutline, calendarOutline } from 'ionicons/icons';
import { useWeeklyMealPlan, type DayPlan } from '@/composables/useWeeklyMealPlan';
import { meals } from '@/data/menu';

const router = useRouter();
const { t } = useI18n();
const { days, orderTime, loaded, savePlan } = useWeeklyMealPlan();

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
function dayKey(dayOfWeek: number): string {
  return dayKeys[dayOfWeek - 1] ?? 'monday';
}

const draftDays = reactive<DayPlan[]>(days.map((d) => ({ ...d })));
const draftTime = ref(orderTime.value);

function syncDraftFromSource() {
  days.forEach((d, i) => {
    draftDays[i].dayOfWeek = d.dayOfWeek;
    draftDays[i].mealId = d.mealId;
  });
  draftTime.value = orderTime.value;
}

watch(loaded, (isLoaded) => {
  if (isLoaded) syncDraftFromSource();
});
if (loaded.value) syncDraftFromSource();

const isDirty = computed(() => {
  if (draftTime.value !== orderTime.value) return true;
  return draftDays.some((d, i) => d.mealId !== days[i].mealId);
});

const saving = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onSave() {
  if (!isDirty.value || saving.value) return;
  saving.value = true;
  try {
    await savePlan(
      draftDays.map((d) => ({ ...d })),
      draftTime.value
    );
    notify(t('weeklyPlan.planSaved'));
  } catch {
    notify(t('weeklyPlan.saveFailed'));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.plan-content {
  --background: var(--ion-color-step-50, #f4f5f8);
  --padding-bottom: 100px;
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
  padding: 4px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.time-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 15px;
  font-family: inherit;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.time-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.day-row:last-child {
  border-bottom: none;
}

.day-label {
  flex-shrink: 0;
  width: 84px;
  font-size: 13px;
  font-weight: 700;
}

.meal-select {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 13px;
  font-family: inherit;
}

.save-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  min-height: 48px;
}

.save-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}

.save-btn ion-spinner {
  width: 20px;
  height: 20px;
}
</style>
