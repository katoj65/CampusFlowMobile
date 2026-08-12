<template>
  <ion-page>
    <ion-content :fullscreen="true" class="dashboard-content">
      <section class="hero">
        <div class="hero-top">
          <div class="hero-greeting-block">
            <p class="hero-eyebrow">{{ formattedDateTime }}</p>
            <h1 class="hero-greeting">{{ greeting }}, {{ studentName }}</h1>
          </div>
          <div class="hero-actions">
            <button class="icon-btn" :aria-label="t('dashboard.notificationsAria')" @click="router.push('/notifications')">
              <ion-icon :icon="notificationsOutline" />
              <span v-if="unreadCount > 0" class="notif-dot"></span>
            </button>
            <CartButton variant="tinted" />
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

        <button class="special-card" v-if="special" @click="goToItem(special.id)">
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
        <div class="special-card special-skeleton" v-else-if="menuLoading">
          <ion-skeleton-text :animated="true" class="image-skeleton"></ion-skeleton-text>
        </div>
      </section>

      <div class="dashboard-body">
        <LiveQueueStatus />

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
          <div class="scroll-row" v-if="menuLoading && recommendations.length === 0">
            <div class="meal-card" v-for="i in 3" :key="i">
              <div class="meal-image-wrap">
                <ion-skeleton-text :animated="true" class="image-skeleton"></ion-skeleton-text>
              </div>
              <div class="meal-info">
                <ion-skeleton-text :animated="true" style="width: 85%; height: 12px"></ion-skeleton-text>
                <ion-skeleton-text :animated="true" style="width: 50%; height: 10px; margin-top: 8px"></ion-skeleton-text>
                <ion-skeleton-text :animated="true" style="width: 40%; height: 12px; margin-top: 8px"></ion-skeleton-text>
              </div>
            </div>
          </div>
          <div class="scroll-row" v-else>
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

        <div class="stat-row" v-if="menuLoading && menuItems.length === 0">
          <ion-card class="panel-card stat-card">
            <ion-skeleton-text :animated="true" style="width: 22px; height: 22px; border-radius: 6px"></ion-skeleton-text>
            <ion-skeleton-text :animated="true" style="width: 36px; height: 20px; margin-top: 6px"></ion-skeleton-text>
            <ion-skeleton-text :animated="true" style="width: 70%; height: 10px; margin-top: 4px"></ion-skeleton-text>
          </ion-card>
          <ion-card class="panel-card stat-card">
            <ion-skeleton-text :animated="true" style="width: 22px; height: 22px; border-radius: 6px"></ion-skeleton-text>
            <ion-skeleton-text :animated="true" style="width: 36px; height: 20px; margin-top: 6px"></ion-skeleton-text>
            <ion-skeleton-text :animated="true" style="width: 70%; height: 10px; margin-top: 4px"></ion-skeleton-text>
          </ion-card>
        </div>
        <div class="stat-row" v-else>
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

        <ion-card class="panel-card nutrition-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('dashboard.todaysNutrition') }}</h2>
              <p class="panel-sub">{{ $t('dashboard.fromWeeklyPlan') }}</p>
            </div>
            <ion-icon :icon="pieChartOutline" />
          </div>

          <button class="today-meal-row" @click="router.push('/weekly-meal-plan')">
            <img v-if="todayMeal" :src="todayMeal.image" :alt="todayMeal.name" class="today-meal-image" loading="lazy" />
            <div v-else class="today-meal-placeholder">
              <ion-icon :icon="calendarOutline" />
            </div>
            <div class="today-meal-text">
              <strong>{{ todayMeal ? todayMeal.name : $t('dashboard.noMealPlannedToday') }}</strong>
              <span v-if="todayMeal" class="today-meal-kcal">
                <ion-icon :icon="flameOutline" />
                {{ t('dashboard.kcalCount', { count: todayMeal.calories }) }}
              </span>
              <span v-else>{{ $t('dashboard.noMealPlannedHint') }}</span>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="today-meal-chevron" />
          </button>
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
import { IonPage, IonContent, IonCard, IonIcon, IonAvatar, IonSkeletonText } from '@ionic/vue';
import { useLanguage } from '@/composables/useLanguage';
import {
  timeOutline,
  alertCircleOutline,
  peopleOutline,
  fastFoodOutline,
  chevronForwardOutline,
  addCircleOutline,
  pieChartOutline,
  flameOutline,
  calendarOutline,
  trophyOutline,
  giftOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { useMenu } from '@/composables/useMenu';
import { formatCurrency } from '@/utils/currency';
import { useNotifications } from '@/composables/useNotifications';
import { useProfile } from '@/composables/useProfile';
import { useQueueStatus } from '@/composables/useQueueStatus';
import { supabase } from '@/services/supabase';
import { useWeeklyMealPlan } from '@/composables/useWeeklyMealPlan';
import CartButton from '@/components/CartButton.vue';
import LiveQueueStatus from '@/components/LiveQueueStatus.vue';

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

const formattedDateTime = computed(() => {
  const date = now.value.toLocaleDateString(locale.value, { weekday: 'long', month: 'long', day: 'numeric' });
  const time = now.value.toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
});

const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return t('dashboard.goodMorning');
  if (hour < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
});

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface CanteenHours {
  opensAt: string;
  closesAt: string;
  openFromDay: string;
  openToDay: string;
}

const canteenHours = ref<CanteenHours | null>(null);

async function fetchCanteenHours() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('university_id')
    .eq('id', userData.user.id)
    .single();
  if (!profile?.university_id) return;

  const { data: university } = await supabase
    .from('universities')
    .select('canteen_opens_at, canteen_closes_at, canteen_open_from_day, canteen_open_to_day')
    .eq('id', profile.university_id)
    .single();
  if (!university) return;

  canteenHours.value = {
    opensAt: university.canteen_opens_at,
    closesAt: university.canteen_closes_at,
    openFromDay: university.canteen_open_from_day,
    openToDay: university.canteen_open_to_day,
  };
}
onMounted(fetchCanteenHours);

function parseTimeOfDay(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number);
  return { hours, minutes };
}

function formatTimeOfDay(value: string): string {
  const { hours, minutes } = parseTimeOfDay(value);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function isDayWithinRange(dayIndex: number, fromIndex: number, toIndex: number): boolean {
  if (fromIndex <= toIndex) return dayIndex >= fromIndex && dayIndex <= toIndex;
  return dayIndex >= fromIndex || dayIndex <= toIndex;
}

const mensaHoursLabel = computed(() => {
  if (!canteenHours.value) return '';
  return `${formatTimeOfDay(canteenHours.value.opensAt)} – ${formatTimeOfDay(canteenHours.value.closesAt)}`;
});

const mensaOpen = computed(() => {
  if (!canteenHours.value) return false;
  const todayIndex = (now.value.getDay() + 6) % 7;
  const fromIndex = WEEKDAYS.indexOf(canteenHours.value.openFromDay);
  const toIndex = WEEKDAYS.indexOf(canteenHours.value.openToDay);
  if (!isDayWithinRange(todayIndex, fromIndex, toIndex)) return false;

  const opens = parseTimeOfDay(canteenHours.value.opensAt);
  const closes = parseTimeOfDay(canteenHours.value.closesAt);
  const nowMinutes = now.value.getHours() * 60 + now.value.getMinutes();
  return nowMinutes >= opens.hours * 60 + opens.minutes && nowMinutes < closes.hours * 60 + closes.minutes;
});

const closingInLabel = computed(() => {
  if (!mensaOpen.value || !canteenHours.value) return t('dashboard.closed');
  const { hours, minutes } = parseTimeOfDay(canteenHours.value.closesAt);
  const close = new Date(now.value);
  close.setHours(hours, minutes, 0, 0);
  const diffMinutes = Math.max(0, Math.round((close.getTime() - now.value.getTime()) / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  if (diffHours <= 0) return `${remainingMinutes} min`;
  return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}m` : `${diffHours}h`;
});

// queueLevelLabel/queueChipClass drive the small hero chip below — the
// full Live Queue Status panel is its own component (see LiveQueueStatus.vue).
const { queueLevelLabel, queueChipClass } = useQueueStatus();

const { meals: menuItems, findMeal, loading: menuLoading } = useMenu();
const special = computed(() => findMeal(3));

const recommendations = computed(() => {
  if (primaryDiet.value === 'No Preference') return menuItems.slice(0, 4);
  const matches = menuItems.filter((meal) => meal.tags.includes(primaryDiet.value));
  return (matches.length ? matches : menuItems).slice(0, 4);
});

const meals = computed(() => ({
  available: menuItems.length,
  left: menuItems.reduce((sum, meal) => sum + meal.available, 0),
  lowThreshold: 10,
}));

const { days: weeklyPlanDays } = useWeeklyMealPlan();

const todayMeal = computed(() => {
  const todayDayOfWeek = ((now.value.getDay() + 6) % 7) + 1;
  const mealId = weeklyPlanDays.find((d) => d.dayOfWeek === todayDayOfWeek)?.mealId;
  return mealId ? findMeal(mealId) : undefined;
});

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
</script>

<style scoped>
.dashboard-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.hero {
  padding: calc(20px + env(safe-area-inset-top)) 20px 28px;
  background: #fdeee1;
  border-radius: 0 0 28px 28px;
  color: #2b2118;
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
  color: rgba(43, 33, 24, 0.6);
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
  background: rgba(43, 33, 24, 0.07);
  color: #2b2118;
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
  border: 2px solid #fdeee1;
}

.hero-avatar {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(43, 33, 24, 0.15);
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
  background: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  flex-shrink: 0;
}

.chip ion-icon {
  font-size: 18px;
  color: rgba(43, 33, 24, 0.7);
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
  color: rgba(43, 33, 24, 0.6);
}

.chip-warn {
  background: rgba(255, 159, 28, 0.16);
}

.chip-warn ion-icon {
  color: #ff9f1c;
}

.chip-low {
  background: rgba(46, 196, 182, 0.16);
}

.chip-low ion-icon {
  color: #2ec4b6;
}

.chip-moderate {
  background: rgba(255, 159, 28, 0.16);
}

.chip-moderate ion-icon {
  color: #ff9f1c;
}

.chip-high {
  background: rgba(255, 59, 48, 0.16);
}

.chip-high ion-icon {
  color: #ff3b30;
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

.image-skeleton {
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
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

.today-meal-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  border: none;
  border-radius: 16px;
  background: var(--ion-color-step-50, #f4f5f8);
  text-align: left;
  font: inherit;
  color: inherit;
}

.today-meal-image {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
}

.today-meal-placeholder {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  font-size: 22px;
}

.today-meal-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.today-meal-text strong {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-meal-text span {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.today-meal-kcal {
  display: flex;
  align-items: center;
  gap: 4px;
}

.today-meal-kcal ion-icon {
  font-size: 13px;
}

.today-meal-chevron {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--ion-color-step-300, #ccc);
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
