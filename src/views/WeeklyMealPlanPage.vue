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

        <div class="summary-card">
          <div class="summary-top">
            <ion-skeleton-text v-if="planLoading" :animated="true" style="width: 140px; height: 14px"></ion-skeleton-text>
            <strong v-else>{{ t('weeklyPlan.daysPlanned', { count: plannedCount }) }}</strong>
            <ion-icon :icon="calendarOutline" />
          </div>
          <div class="summary-track">
            <div class="summary-fill" :style="{ width: (planLoading ? 0 : plannedCount / 7) * 100 + '%' }"></div>
          </div>
        </div>

        <section class="detail-section">
          <h2>
            <ion-icon :icon="timeOutline" />
            {{ $t('weeklyPlan.orderTime') }}
          </h2>
          <p class="section-hint">{{ $t('weeklyPlan.orderTimeHint') }}</p>
          <button class="time-trigger" id="order-time-trigger">
            <ion-icon :icon="alarmOutline" class="time-trigger-icon" />
            <span>{{ formattedOrderTime }}</span>
            <ion-icon :icon="chevronForwardOutline" class="row-chevron" />
          </button>
          <ion-popover trigger="order-time-trigger" trigger-action="click" class="time-popover">
            <ion-datetime
              presentation="time"
              :value="draftTimeIso"
              minute-values="0,5,10,15,20,25,30,35,40,45,50,55"
              @ionChange="onTimeChange"
            ></ion-datetime>
          </ion-popover>
        </section>

        <section class="detail-section">
          <h2>
            <ion-icon :icon="calendarOutline" />
            {{ $t('weeklyPlan.days') }}
          </h2>
          <div class="day-list" v-if="planLoading">
            <div class="day-row" v-for="i in 7" :key="i">
              <ion-skeleton-text :animated="true" style="width: 34px; height: 34px; border-radius: 50%; margin: 0"></ion-skeleton-text>
              <div class="day-info">
                <ion-skeleton-text :animated="true" style="width: 60px; height: 12px"></ion-skeleton-text>
                <ion-skeleton-text :animated="true" style="width: 110px; height: 11px; margin-top: 5px"></ion-skeleton-text>
              </div>
            </div>
          </div>
          <div class="day-list" v-else>
            <div class="day-row" v-for="day in draftDays" :key="day.dayOfWeek">
              <div class="day-badge" :class="{ filled: day.mealId }">{{ dayInitial(day.dayOfWeek) }}</div>
              <div class="day-info">
                <span class="day-name">{{ $t(`weeklyPlan.day.${dayKey(day.dayOfWeek)}`) }}</span>
                <span class="day-meal" :class="{ empty: !day.mealId }">
                  {{ day.mealId ? mealName(day.mealId) : $t('weeklyPlan.tapToChoose') }}
                </span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="row-chevron" />
              <ion-select
                class="meal-select-overlay"
                interface="popover"
                :interface-options="{ cssClass: 'meal-popover' }"
                :value="day.mealId"
                :aria-label="$t(`weeklyPlan.day.${dayKey(day.dayOfWeek)}`)"
                @ionChange="day.mealId = $event.detail.value"
              >
                <ion-select-option :value="null">{{ $t('weeklyPlan.noMeal') }}</ion-select-option>
                <ion-select-option v-for="meal in meals" :key="meal.id" :value="meal.id">
                  {{ meal.name }} — {{ formatCurrency(meal.price) }}
                </ion-select-option>
              </ion-select>
            </div>
          </div>
        </section>
      </div>

      <div class="save-footer" slot="fixed">
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
import {
  IonPage,
  IonContent,
  IonIcon,
  IonToast,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonPopover,
  IonDatetime,
  IonSkeletonText,
} from '@ionic/vue';
import { chevronBackOutline, timeOutline, calendarOutline, alarmOutline, chevronForwardOutline } from 'ionicons/icons';
import { useWeeklyMealPlan, type DayPlan } from '@/composables/useWeeklyMealPlan';
import { useMenu } from '@/composables/useMenu';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const { t } = useI18n();
const { days, orderTime, loaded, loading: planLoading, savePlan } = useWeeklyMealPlan();
const { meals, findMeal } = useMenu();

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function dayKey(dayOfWeek: number): string {
  return dayKeys[dayOfWeek - 1] ?? 'monday';
}
function dayInitial(dayOfWeek: number): string {
  return dayInitials[dayOfWeek - 1] ?? 'M';
}
function mealName(mealId: number): string {
  return findMeal(mealId)?.name ?? '';
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

const plannedCount = computed(() => draftDays.filter((d) => d.mealId !== null).length);

function formatTimeOfDay(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

const formattedOrderTime = computed(() => formatTimeOfDay(draftTime.value));
const draftTimeIso = computed(() => `2000-01-01T${draftTime.value}:00`);

function onTimeChange(event: CustomEvent) {
  const value = event.detail.value as string | null;
  if (!value) return;
  draftTime.value = value.slice(11, 16);
}

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
  gap: 20px;
}

.intro {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.summary-card {
  padding: 16px;
  border-radius: 18px;
  background: #fdeee1;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-top strong {
  font-size: 14px;
  color: #2b2118;
}

.summary-top ion-icon {
  font-size: 18px;
  color: #ff6b35;
}

.summary-track {
  margin-top: 10px;
  height: 6px;
  border-radius: 999px;
  background: rgba(43, 33, 24, 0.1);
  overflow: hidden;
}

.summary-fill {
  height: 100%;
  border-radius: 999px;
  background: #ff6b35;
  transition: width 0.3s ease;
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

.time-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 14px;
  border-radius: 14px;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  text-align: left;
}

.time-trigger-icon {
  font-size: 18px;
  color: #ff6b35;
}

.time-trigger span {
  flex: 1;
}

.time-popover::part(content) {
  border-radius: 18px;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 14px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.day-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.day-row:last-child {
  border-bottom: none;
}

.day-badge {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: var(--ion-color-step-100, #eee);
  color: var(--ion-color-medium);
}

.day-badge.filled {
  background: rgba(255, 107, 53, 0.14);
  color: #ff6b35;
}

.day-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-name {
  font-size: 13px;
  font-weight: 700;
}

.day-meal {
  font-size: 12px;
  color: var(--ion-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-meal.empty {
  color: var(--ion-color-medium);
}

.row-chevron {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--ion-color-step-300, #ccc);
}

.meal-select-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  --padding-start: 0;
  --padding-end: 0;
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

<style>
/* ion-select's popover is created dynamically outside this component, so it
   can't be reached with scoped styles — cssClass + a global rule is the only
   way to restyle it. */
.meal-popover::part(content) {
  border-radius: 18px;
  --width: 280px;
  --max-height: 340px;
  --box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.35);
}

.meal-popover ion-radio {
  --color-checked: #ff6b35;
}
</style>
