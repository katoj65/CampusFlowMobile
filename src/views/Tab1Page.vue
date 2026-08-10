<template>
  <ion-page>
    <ion-content :fullscreen="true" class="dashboard-content">
      <section class="hero">
        <div class="hero-top">
          <div class="hero-greeting-block">
            <p class="hero-eyebrow">{{ formattedDate }}</p>
            <h1 class="hero-greeting">{{ greeting }}, {{ studentName }} <span class="wave">👋</span></h1>
          </div>
          <div class="hero-actions">
            <button class="icon-btn" :aria-label="t('dashboard.notificationsAria')" @click="router.push('/notifications')">
              <ion-icon :icon="notificationsOutline" />
              <span v-if="unreadCount > 0" class="notif-dot"></span>
            </button>
            <CartButton variant="dark" />
            <ion-avatar class="hero-avatar">
              <img :src="avatarUrl" :alt="t('dashboard.profilePhotoAlt', { name: studentName })" />
            </ion-avatar>
          </div>
        </div>

        <div class="status-chips">
          <div class="chip">
            <ion-icon :icon="timeOutline" />
            <div class="chip-text">
              <strong>{{ mensaOpen ? $t('dashboard.openNow') : $t('dashboard.closed') }}</strong>
              <span>{{ mensaHoursLabel }}</span>
            </div>
          </div>
          <div class="chip chip-warn">
            <ion-icon :icon="alertCircleOutline" />
            <div class="chip-text">
              <strong>{{ $t('dashboard.closingIn') }}</strong>
              <span>{{ closingInLabel }}</span>
            </div>
          </div>
          <div class="chip" :class="queueChipClass">
            <ion-icon :icon="peopleOutline" />
            <div class="chip-text">
              <strong>{{ $t('dashboard.queue') }}</strong>
              <span>{{ queueLevelLabel }}</span>
            </div>
          </div>
        </div>

        <button class="special-card" @click="goToItem(special.id)">
          <img :src="special.image" :alt="special.name" class="special-image" loading="lazy" />
          <div class="special-scrim"></div>
          <div class="special-content">
            <span class="special-badge">{{ $t('dashboard.todaysSpecial') }}</span>
            <h3>{{ special.name }}</h3>
            <p>{{ special.description }}</p>
            <div class="special-meta">
              <span>{{ formatCurrency(special.price) }}</span>
              <span class="dot">•</span>
              <ion-icon :icon="flameOutline" />
              <span>{{ special.calories }} kcal</span>
            </div>
          </div>
        </button>
      </section>

      <div class="dashboard-body">
        <ion-card class="panel-card queue-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('dashboard.liveQueueStatus') }}</h2>
              <p class="panel-sub">{{ $t('dashboard.mensaGroundFloor') }}</p>
            </div>
            <span class="live-dot"><span class="live-dot-core"></span>{{ $t('dashboard.live') }}</span>
          </div>
          <div class="queue-meter">
            <div class="queue-meter-track">
              <div class="queue-meter-fill" :class="queueChipClass" :style="{ width: queueMeterWidth }"></div>
            </div>
            <div class="queue-meter-labels">
              <span>{{ $t('dashboard.meterLow') }}</span><span>{{ $t('dashboard.meterMedium') }}</span><span>{{ $t('dashboard.meterHigh') }}</span>
            </div>
          </div>
          <div class="queue-stats">
            <div>
              <strong>{{ queue.estimateMinutes }} min</strong>
              <span>{{ $t('dashboard.estWaitTime') }}</span>
            </div>
            <div>
              <strong>{{ minutesToPickup }} min</strong>
              <span>{{ $t('dashboard.untilYourPickup') }}</span>
            </div>
          </div>
        </ion-card>

        <section class="section-block">
          <div class="section-header">
            <div>
              <h2>{{ $t('dashboard.recommendedForYou') }}</h2>
              <p class="panel-sub">{{ t('dashboard.curatedForDiet', { diet: primaryDiet }) }}</p>
            </div>
            <button class="link-btn" @click="goToMenu">
              {{ $t('dashboard.seeAll') }} <ion-icon :icon="chevronForwardOutline" />
            </button>
          </div>
          <div class="scroll-row">
            <button class="meal-card" v-for="meal in recommendations" :key="meal.id" @click="goToItem(meal.id)">
              <div class="meal-image-wrap">
                <img :src="meal.image" :alt="meal.name" loading="lazy" />
                <span class="add-btn" :aria-label="t('dashboard.viewItemAria')">
                  <ion-icon :icon="addCircleOutline" />
                </span>
              </div>
              <div class="meal-info">
                <h4>{{ meal.name }}</h4>
                <div class="meal-tags">
                  <span class="tag" v-for="tag in meal.tags" :key="tag">{{ tag }}</span>
                </div>
                <span class="meal-price">{{ formatCurrency(meal.price) }}</span>
              </div>
            </button>
          </div>
        </section>

        <div class="stat-row">
          <ion-card class="panel-card stat-card">
            <ion-icon :icon="fastFoodOutline" class="stat-icon" />
            <strong class="stat-value">{{ meals.available }}</strong>
            <span class="stat-label">{{ $t('dashboard.mealsAvailableToday') }}</span>
          </ion-card>
          <ion-card class="panel-card stat-card" :class="{ 'stat-card-alert': meals.left <= meals.lowThreshold }">
            <ion-icon :icon="alertCircleOutline" class="stat-icon" />
            <strong class="stat-value">{{ meals.left }}</strong>
            <span class="stat-label">{{ $t('dashboard.mealsLeftToday') }}</span>
          </ion-card>
        </div>

        <ion-card class="panel-card pickup-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('dashboard.nextPickupSlot') }}</h2>
              <p class="panel-sub">{{ t('dashboard.orderNumber', { id: nextPickup.orderId }) }}</p>
            </div>
            <span class="pickup-countdown">{{ t('dashboard.inMinutes', { minutes: minutesToPickup }) }}</span>
          </div>
          <div class="pickup-body">
            <div class="pickup-time">
              <ion-icon :icon="walkOutline" />
              <span>{{ nextPickup.slotStart }} – {{ nextPickup.slotEnd }}</span>
            </div>
            <div class="pickup-location">
              <ion-icon :icon="locationOutline" />
              <span>{{ nextPickup.location }}</span>
            </div>
          </div>
          <button class="primary-btn" @click="goToOrders">
            {{ $t('dashboard.viewOrder') }} <ion-icon :icon="chevronForwardOutline" />
          </button>
        </ion-card>

        <ion-card class="panel-card nutrition-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('dashboard.todaysNutrition') }}</h2>
              <p class="panel-sub">{{ $t('dashboard.basedOnLoggedMeals') }}</p>
            </div>
            <ion-icon :icon="pieChartOutline" />
          </div>
          <div class="nutrition-calories">
            <strong>{{ nutrition.calories.consumed }}</strong>
            <span>{{ t('dashboard.kcalGoal', { goal: nutrition.calories.goal }) }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: caloriesProgress + '%' }"></div>
          </div>
          <div class="macro-row">
            <div class="macro" v-for="macro in macros" :key="macro.label">
              <ion-icon :icon="macro.icon" />
              <div class="macro-text">
                <strong>{{ macro.consumed }}{{ macro.unit }}</strong>
                <span>{{ macro.label }}</span>
              </div>
              <div class="macro-track">
                <div class="macro-fill" :style="{ width: macro.progress + '%', background: macro.color }"></div>
              </div>
            </div>
          </div>
        </ion-card>

        <ion-card class="panel-card loyalty-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('dashboard.loyaltyRewards') }}</h2>
              <p class="panel-sub">{{ t('dashboard.tierMember', { tier: loyalty.tier }) }}</p>
            </div>
            <ion-icon :icon="trophyOutline" />
          </div>
          <div class="loyalty-points">
            <strong>{{ loyalty.points }}</strong>
            <span>{{ $t('dashboard.points') }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill loyalty-fill" :style="{ width: loyalty.tierProgress * 100 + '%' }"></div>
          </div>
          <p class="loyalty-note">
            <ion-icon :icon="giftOutline" />
            {{ t('dashboard.pointsToNextTier', { points: loyalty.pointsToNext, tier: loyalty.nextTier }) }}
          </p>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonCard, IonIcon, IonAvatar } from '@ionic/vue';
import { useLanguage } from '@/composables/useLanguage';
import {
  timeOutline,
  alertCircleOutline,
  peopleOutline,
  fastFoodOutline,
  walkOutline,
  locationOutline,
  chevronForwardOutline,
  addCircleOutline,
  pieChartOutline,
  flameOutline,
  barbellOutline,
  leafOutline,
  waterOutline,
  trophyOutline,
  giftOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { meals as menuItems, findMeal } from '@/data/menu';
import { formatCurrency } from '@/utils/currency';
import { useNotifications } from '@/composables/useNotifications';
import { useProfile } from '@/composables/useProfile';
import CartButton from '@/components/CartButton.vue';

interface MacroItem {
  label: string;
  consumed: number;
  unit: string;
  progress: number;
  color: string;
  icon: string;
}

const router = useRouter();
const { t } = useI18n();
const { locale } = useLanguage();
const { unreadCount } = useNotifications();

const studentName = ref('Joshua');
const { primaryDiet } = useProfile();
const avatarUrl = computed(
  () => `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName.value)}&background=FF6B35&color=fff&bold=true&size=128`
);

const now = ref(new Date());
let clockTimer: number | undefined;
onMounted(() => {
  clockTimer = window.setInterval(() => {
    now.value = new Date();
  }, 60000);
});
onUnmounted(() => {
  if (clockTimer) window.clearInterval(clockTimer);
});

const formattedDate = computed(() =>
  now.value.toLocaleDateString(locale.value, { weekday: 'long', month: 'long', day: 'numeric' })
);

const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return t('dashboard.goodMorning');
  if (hour < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
});

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

const mensaHours = { openHour: 8, closeHour: 20 };
const mensaHoursLabel = `${formatHour(mensaHours.openHour)} – ${formatHour(mensaHours.closeHour)}`;

const mensaOpen = computed(() => {
  const hour = now.value.getHours();
  return hour >= mensaHours.openHour && hour < mensaHours.closeHour;
});

const closingInLabel = computed(() => {
  if (!mensaOpen.value) return t('dashboard.closed');
  const close = new Date(now.value);
  close.setHours(mensaHours.closeHour, 0, 0, 0);
  const diffMinutes = Math.max(0, Math.round((close.getTime() - now.value.getTime()) / 60000));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
});

const queue = ref<{ level: 'Low' | 'Moderate' | 'High'; levelIndex: number; estimateMinutes: number }>({
  level: 'Moderate',
  levelIndex: 2,
  estimateMinutes: 8,
});

const queueLevelLabel = computed(() => {
  if (queue.value.level === 'Low') return t('dashboard.queueLow');
  if (queue.value.level === 'High') return t('dashboard.queueHigh');
  return t('dashboard.queueModerate');
});

const queueChipClass = computed(() => ({
  'chip-low': queue.value.level === 'Low',
  'chip-moderate': queue.value.level === 'Moderate',
  'chip-high': queue.value.level === 'High',
}));

const queueMeterWidth = computed(() => `${(queue.value.levelIndex / 3) * 100}%`);

const special = findMeal(3)!;

const recommendations = computed(() => {
  if (primaryDiet.value === 'No Preference') return menuItems.slice(0, 4);
  const matches = menuItems.filter((meal) => meal.tags.includes(primaryDiet.value));
  return (matches.length ? matches : menuItems).slice(0, 4);
});

const meals = ref({
  available: 32,
  left: 9,
  lowThreshold: 10,
});

const nextPickup = ref({
  orderId: '10482',
  slotStart: '12:45 PM',
  slotEnd: '1:00 PM',
  location: 'Mensa Ground Floor, Counter 2',
  minutesFromNow: 18,
});

const minutesToPickup = computed(() => nextPickup.value.minutesFromNow);

const nutrition = ref({
  calories: { consumed: 1450, goal: 2100 },
});

const caloriesProgress = computed(() =>
  Math.min(100, Math.round((nutrition.value.calories.consumed / nutrition.value.calories.goal) * 100))
);

const macros = computed<MacroItem[]>(() => [
  { label: t('dashboard.protein'), consumed: 62, unit: 'g', progress: 68, color: '#FF6B35', icon: barbellOutline },
  { label: t('dashboard.carbs'), consumed: 145, unit: 'g', progress: 54, color: '#2EC4B6', icon: leafOutline },
  { label: t('dashboard.fat'), consumed: 48, unit: 'g', progress: 72, color: '#5B8DEF', icon: waterOutline },
]);

const loyalty = ref({
  points: 480,
  tier: 'Silver',
  nextTier: 'Gold',
  pointsToNext: 120,
  tierProgress: 0.8,
});

function goToMenu() {
  router.push('/tabs/tab2');
}

function goToItem(id: number) {
  router.push(`/item/${id}`);
}

function goToOrders() {
  router.push('/tabs/tab3');
}
</script>

<style scoped>
.dashboard-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.hero {
  padding: calc(20px + env(safe-area-inset-top)) 20px 28px;
  background: linear-gradient(135deg, #2b2118 0%, #6b3f26 45%, #ff6b35 100%);
  border-radius: 0 0 28px 28px;
  color: #fff;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hero-eyebrow {
  margin: 0 0 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.hero-greeting {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.wave {
  display: inline-block;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.notif-dot {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff3b30;
  border: 2px solid #6b3f26;
}

.hero-avatar {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.status-chips {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  overflow-x: auto;
}

.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  white-space: nowrap;
  flex-shrink: 0;
}

.chip ion-icon {
  font-size: 18px;
}

.chip-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  font-size: 12px;
}

.chip-text strong {
  font-size: 12px;
}

.chip-text span {
  color: rgba(255, 255, 255, 0.8);
}

.chip-warn {
  background: rgba(255, 159, 28, 0.28);
}

.chip-low {
  background: rgba(46, 196, 182, 0.3);
}

.chip-moderate {
  background: rgba(255, 159, 28, 0.3);
}

.chip-high {
  background: rgba(255, 59, 48, 0.32);
}

.special-card {
  position: relative;
  margin-top: 20px;
  border-radius: 20px;
  overflow: hidden;
  height: 180px;
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  border: none;
  padding: 0;
  display: block;
  text-align: left;
  font: inherit;
  color: inherit;
}

.special-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.special-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.05) 60%);
}

.special-content {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  color: #fff;
}

.special-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: #ff6b35;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.special-content h3 {
  margin: 8px 0 2px;
  font-size: 18px;
}

.special-content p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.special-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
}

.special-meta .dot {
  color: rgba(255, 255, 255, 0.6);
}

.special-meta ion-icon {
  font-size: 15px;
}

.dashboard-body {
  padding: 18px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

ion-card.panel-card {
  margin: 0;
  padding: 18px;
  border-radius: 20px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.panel-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.panel-header > ion-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}

.live-dot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2ec4b6;
  flex-shrink: 0;
}

.live-dot-core {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ec4b6;
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 196, 182, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(46, 196, 182, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 196, 182, 0);
  }
}

.queue-meter {
  margin-top: 16px;
}

.queue-meter-track {
  height: 10px;
  border-radius: 999px;
  background: var(--ion-color-step-150, #e8e8e8);
  overflow: hidden;
}

.queue-meter-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
  background: #ff9f1c;
}

.queue-meter-fill.chip-low {
  background: #2ec4b6;
}

.queue-meter-fill.chip-moderate {
  background: #ff9f1c;
}

.queue-meter-fill.chip-high {
  background: #ff3b30;
}

.queue-meter-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.queue-stats {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.queue-stats > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 14px;
  background: var(--ion-color-step-50, #f4f5f8);
}

.queue-stats strong {
  font-size: 18px;
}

.queue-stats span {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 2px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #ff6b35;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.link-btn ion-icon {
  font-size: 16px;
}

.scroll-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
}

.meal-card {
  flex: 0 0 auto;
  width: 152px;
  scroll-snap-align: start;
  background: var(--ion-card-background, #fff);
  border-radius: 18px;
  box-shadow: 0 10px 30px -20px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  border: none;
  padding: 0;
  text-align: left;
  font: inherit;
  color: inherit;
}

.meal-image-wrap {
  position: relative;
  height: 96px;
  background: var(--ion-color-step-100, #eee);
}

.meal-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.add-btn {
  position: absolute;
  right: 8px;
  bottom: -14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #ff6b35;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 6px 14px -4px rgba(255, 107, 53, 0.7);
}

.meal-info {
  padding: 18px 10px 12px;
}

.meal-info h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
}

.meal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  color: #2ec4b6;
  background: rgba(46, 196, 182, 0.12);
  padding: 2px 7px;
  border-radius: 999px;
}

.meal-price {
  font-size: 13px;
  font-weight: 700;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.stat-icon {
  font-size: 22px;
  color: #ff6b35;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.stat-card-alert .stat-icon,
.stat-card-alert .stat-value {
  color: #ff3b30;
}

.pickup-countdown {
  font-size: 12px;
  font-weight: 700;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.12);
  padding: 4px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.pickup-body {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pickup-time,
.pickup-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.pickup-time ion-icon,
.pickup-location ion-icon {
  font-size: 18px;
  color: var(--ion-color-medium);
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.nutrition-calories {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.nutrition-calories strong {
  font-size: 22px;
}

.nutrition-calories span {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.progress-track {
  margin-top: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--ion-color-step-150, #e8e8e8);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff6b35, #ff9f1c);
  transition: width 0.3s ease;
}

.loyalty-fill {
  background: linear-gradient(90deg, #8a5cf6, #ff6b35);
}

.macro-row {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.macro {
  display: grid;
  grid-template-columns: 20px 1fr;
  column-gap: 10px;
  row-gap: 6px;
  align-items: center;
}

.macro > ion-icon {
  font-size: 18px;
  color: var(--ion-color-medium);
}

.macro-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
}

.macro-text span {
  color: var(--ion-color-medium);
}

.macro-track {
  grid-column: 2 / 3;
  height: 6px;
  border-radius: 999px;
  background: var(--ion-color-step-150, #e8e8e8);
  overflow: hidden;
}

.macro-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.loyalty-points {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.loyalty-points strong {
  font-size: 26px;
}

.loyalty-points span {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.loyalty-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.loyalty-note ion-icon {
  font-size: 16px;
  color: #8a5cf6;
}
</style>
