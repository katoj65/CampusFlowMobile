<template>
  <ion-page>
    <ion-content :fullscreen="true" class="confirm-content" v-if="order">
      <div class="confirm-body">
        <div class="success-icon">
          <ion-icon :icon="checkmarkCircle" />
        </div>
        <h1>{{ $t('confirmation.orderPlaced') }}</h1>
        <p class="confirm-sub">{{ t('confirmation.readyForPickup', { id: order.id }) }}</p>

        <div class="panel-card code-card">
          <ion-icon :icon="qrCodeOutline" class="code-icon" />
          <p class="code-label">{{ $t('orders.showCodeAtCounter') }}</p>
          <p class="code-value">{{ order.code }}</p>
        </div>

        <div class="panel-card info-card">
          <div class="info-row">
            <ion-icon :icon="timeOutline" />
            <span>{{ order.pickupSlot }}</span>
          </div>
          <div class="info-row">
            <ion-icon :icon="locationOutline" />
            <span>{{ order.location }}</span>
          </div>
          <div class="info-row">
            <ion-icon :icon="cardOutline" />
            <span>{{ order.paymentMethod }}</span>
          </div>
        </div>

        <div class="panel-card items-card">
          <div class="item-row" v-for="item in order.items" :key="item.name">
            <span>{{ item.qty }}× {{ item.name }}</span>
            <span>{{ formatCurrency(item.price * item.qty) }}</span>
          </div>
          <div class="item-row total-row">
            <span>{{ $t('orders.total') }}</span>
            <span>{{ formatCurrency(order.total) }}</span>
          </div>
        </div>
      </div>

      <div class="confirm-footer">
        <button class="track-btn" @click="router.replace(`/order-tracking/${order.id}`)">
          <ion-icon :icon="receiptOutline" />
          {{ $t('confirmation.trackOrder') }}
        </button>
        <button class="menu-btn" @click="router.replace('/tabs/tab2')">{{ $t('item.backToMenu') }}</button>
      </div>
    </ion-content>

    <ion-content :fullscreen="true" v-else>
      <div class="not-found">
        <ion-icon :icon="fastFoodOutline" />
        <h3>{{ $t('confirmation.noRecentOrder') }}</h3>
        <button class="primary-btn" @click="router.replace('/tabs/tab2')">{{ $t('orders.browseMenu') }}</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import {
  checkmarkCircle,
  qrCodeOutline,
  timeOutline,
  locationOutline,
  cardOutline,
  receiptOutline,
  fastFoodOutline,
} from 'ionicons/icons';
import { useOrders } from '@/composables/useOrders';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const { t } = useI18n();
const { activeOrder: order } = useOrders();
</script>

<style scoped>
.confirm-content {
  --background: var(--ion-color-step-50, #f4f5f8);
  --padding-bottom: 110px;
}

.confirm-body {
  padding: calc(48px + env(safe-area-inset-top)) 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}

.success-icon {
  font-size: 64px;
  color: #2ec4b6;
}

.confirm-body h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.confirm-sub {
  margin: -8px 0 6px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.panel-card {
  width: 100%;
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
  text-align: left;
}

.code-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border: 1.5px dashed var(--ion-color-step-200, #ddd);
}

.code-icon {
  font-size: 28px;
  color: #ff6b35;
}

.code-label {
  margin: 8px 0 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.code-value {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.info-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-row ion-icon {
  font-size: 18px;
  color: var(--ion-color-medium);
}

.items-card {
  padding: 16px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  border-top: 1px solid var(--ion-color-step-100, #eee);
}

.item-row:first-of-type {
  border-top: none;
}

.total-row {
  margin-top: 4px;
  border-top: 1.5px solid var(--ion-color-step-150, #e8e8e8);
  font-weight: 700;
  font-size: 14px;
}

.confirm-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.track-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
}

.menu-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 16px;
  background: none;
  color: var(--ion-color-medium);
  font-weight: 600;
  font-size: 13px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.not-found ion-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.primary-btn {
  margin-top: 16px;
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}
</style>
