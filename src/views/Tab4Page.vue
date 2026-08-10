<template>
  <ion-page>
    <ion-content :fullscreen="true" class="rewards-content">
      <div class="hero">
        <div class="hero-top">
          <div>
            <p class="hero-eyebrow">{{ t('dashboard.tierMember', { tier }) }}</p>
            <h1 class="hero-points">{{ points }} <span>{{ $t('rewards.pts') }}</span></h1>
          </div>
          <ion-icon :icon="trophyOutline" class="hero-trophy" />
        </div>

        <div class="tier-progress">
          <div class="tier-progress-track">
            <div class="tier-progress-fill" :style="{ width: tierProgress * 100 + '%' }"></div>
          </div>
          <p class="tier-progress-label">{{ t('dashboard.pointsToNextTier', { points: pointsToNext, tier: nextTier }) }}</p>
        </div>
      </div>

      <div class="page-body">
        <section class="section-block">
          <div class="section-header">
            <h2>{{ $t('rewards.redeemRewards') }}</h2>
          </div>
          <div class="rewards-grid">
            <div class="panel-card reward-card" v-for="reward in rewards" :key="reward.id">
              <div class="reward-icon" :style="{ background: reward.color + '22', color: reward.color }">
                <ion-icon :icon="reward.icon" />
              </div>
              <h4>{{ reward.name }}</h4>
              <p class="reward-desc">{{ reward.description }}</p>
              <button
                class="redeem-btn"
                :disabled="points < reward.cost"
                @click="onRedeem(reward)"
              >
                <ion-icon :icon="points < reward.cost ? lockClosedOutline : giftOutline" />
                {{ t('rewards.ptsCost', { cost: reward.cost }) }}
              </button>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-header">
            <h2>{{ $t('rewards.waysToEarn') }}</h2>
          </div>
          <div class="panel-card earn-card">
            <div class="earn-row" v-for="way in waysToEarn" :key="way.label">
              <div class="earn-icon">
                <ion-icon :icon="way.icon" />
              </div>
              <div class="earn-text">
                <strong>{{ way.label }}</strong>
                <span>{{ way.description }}</span>
              </div>
              <span class="earn-points">+{{ way.points }}</span>
            </div>
          </div>
        </section>
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue';
import {
  trophyOutline,
  giftOutline,
  lockClosedOutline,
  cafeOutline,
  pricetagOutline,
  iceCreamOutline,
  fastFoodOutline,
  receiptOutline,
  peopleOutline,
  starOutline,
} from 'ionicons/icons';

interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
  color: string;
}

interface EarnWay {
  label: string;
  description: string;
  points: number;
  icon: string;
}

const { t } = useI18n();

const points = ref(480);
const tier = ref('Silver');
const nextTier = ref('Gold');
const tierGoal = 600;

const pointsToNext = computed(() => Math.max(0, tierGoal - points.value));
const tierProgress = computed(() => Math.min(1, points.value / tierGoal));

const rewards = computed<Reward[]>(() => [
  {
    id: 1,
    name: t('rewards.freeCoffee'),
    description: t('rewards.freeCoffeeDesc'),
    cost: 150,
    icon: cafeOutline,
    color: '#ff9f1c',
  },
  {
    id: 2,
    name: t('rewards.freeDessert'),
    description: t('rewards.freeDessertDesc'),
    cost: 200,
    icon: iceCreamOutline,
    color: '#8a5cf6',
  },
  {
    id: 3,
    name: t('rewards.tenPercentOff'),
    description: t('rewards.tenPercentOffDesc'),
    cost: 300,
    icon: pricetagOutline,
    color: '#2ec4b6',
  },
  {
    id: 4,
    name: t('rewards.freeMeal'),
    description: t('rewards.freeMealDesc'),
    cost: 600,
    icon: fastFoodOutline,
    color: '#ff6b35',
  },
]);

const waysToEarn = computed<EarnWay[]>(() => [
  { label: t('rewards.placeOrder'), description: t('rewards.placeOrderDesc'), points: 10, icon: receiptOutline },
  { label: t('rewards.orderBefore11'), description: t('rewards.orderBefore11Desc'), points: 5, icon: starOutline },
  { label: t('rewards.referFriend'), description: t('rewards.referFriendDesc'), points: 50, icon: peopleOutline },
]);

const showToast = ref(false);
const toastMessage = ref('');

function onRedeem(reward: Reward) {
  if (points.value < reward.cost) {
    toastMessage.value = t('rewards.needMorePoints', { points: reward.cost - points.value, name: reward.name });
    showToast.value = true;
    return;
  }
  points.value -= reward.cost;
  toastMessage.value = t('rewards.redeemed', { name: reward.name });
  showToast.value = true;
}
</script>

<style scoped>
.rewards-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.hero {
  padding: calc(20px + env(safe-area-inset-top)) 20px 26px;
  background: linear-gradient(135deg, #2b1e3d 0%, #6a3fa0 45%, #ff6b35 100%);
  border-radius: 0 0 28px 28px;
  color: #fff;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-eyebrow {
  margin: 0 0 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.hero-points {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
}

.hero-points span {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.hero-trophy {
  font-size: 34px;
  color: rgba(255, 255, 255, 0.85);
}

.tier-progress {
  margin-top: 22px;
}

.tier-progress-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.tier-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #fff;
  transition: width 0.3s ease;
}

.tier-progress-label {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.page-body {
  padding: 18px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.rewards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.panel-card {
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
}

.reward-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.reward-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 6px;
}

.reward-card h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.reward-desc {
  margin: 0 0 10px;
  font-size: 11px;
  color: var(--ion-color-medium);
  min-height: 28px;
}

.redeem-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 9px;
  border: none;
  border-radius: 12px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
}

.redeem-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}

.earn-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.earn-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.earn-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.earn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.earn-text span {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.earn-points {
  font-weight: 700;
  font-size: 13px;
  color: #2ec4b6;
  flex-shrink: 0;
}
</style>
