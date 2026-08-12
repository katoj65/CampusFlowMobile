<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tracking-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('confirmation.trackOrder') }}</h1>
      </div>

      <div v-if="loading" class="page-body">
        <div class="panel-card order-status-card">
          <div class="panel-header">
            <div>
              <ion-skeleton-text :animated="true" style="width: 100px; height: 16px"></ion-skeleton-text>
              <ion-skeleton-text :animated="true" style="width: 80px; height: 11px; margin-top: 6px"></ion-skeleton-text>
            </div>
            <ion-skeleton-text :animated="true" style="width: 56px; height: 20px; border-radius: 999px"></ion-skeleton-text>
          </div>
          <ion-skeleton-text :animated="true" style="width: 100%; height: 60px; margin-top: 20px"></ion-skeleton-text>
          <ion-skeleton-text :animated="true" style="width: 70%; height: 14px; margin-top: 18px"></ion-skeleton-text>
          <ion-skeleton-text :animated="true" style="width: 55%; height: 14px; margin-top: 10px"></ion-skeleton-text>
        </div>
        <div class="panel-card code-card">
          <ion-skeleton-text :animated="true" style="width: 40%; height: 30px; margin: 0 auto"></ion-skeleton-text>
        </div>
        <div class="panel-card items-card">
          <ion-skeleton-text :animated="true" style="width: 50%; height: 14px"></ion-skeleton-text>
          <ion-skeleton-text :animated="true" style="width: 100%; height: 16px; margin-top: 14px"></ion-skeleton-text>
          <ion-skeleton-text :animated="true" style="width: 100%; height: 16px; margin-top: 10px"></ion-skeleton-text>
        </div>
      </div>

      <div v-else-if="!order" class="empty-state">
        <ion-icon :icon="receiptOutline" />
        <h3>{{ $t('orders.orderNotFound') }}</h3>
        <p>{{ $t('orders.orderNotFoundHint') }}</p>
        <button class="primary-btn" @click="router.replace('/tabs/tab3')">{{ $t('orders.active') }}</button>
      </div>

      <div v-else class="page-body">
        <div class="panel-card order-status-card">
          <div class="panel-header">
            <div>
              <h2>{{ t('dashboard.orderNumber', { id: order.id }) }}</h2>
              <p class="panel-sub">{{ order.date }}</p>
            </div>
            <span class="status-badge" :class="`status-${order.status}`">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div v-if="order.status === 'cancelled'" class="cancelled-notice">
            <ion-icon :icon="closeCircleOutline" />
            {{ $t('orders.cancelledNotice') }}
          </div>
          <div v-else class="stepper">
            <template v-for="(step, i) in steps" :key="step.key">
              <div class="step" :class="stepClass(i)">
                <div class="step-icon">
                  <ion-icon :icon="i < currentStepIndex ? checkmarkCircle : ellipseOutline" />
                </div>
                <span>{{ step.label }}</span>
              </div>
              <div v-if="i < steps.length - 1" class="step-line" :class="{ done: i < currentStepIndex }"></div>
            </template>
          </div>

          <div class="pickup-body">
            <div class="pickup-time">
              <ion-icon :icon="timeOutline" />
              <span>{{ order.pickupSlot }}</span>
            </div>
            <div class="pickup-location">
              <ion-icon :icon="locationOutline" />
              <span>{{ order.location }}</span>
            </div>
            <div class="pickup-location">
              <ion-icon :icon="cardOutline" />
              <span>{{ order.paymentMethod }}</span>
            </div>
          </div>
        </div>

        <div class="panel-card code-card">
          <ion-icon :icon="qrCodeOutline" class="code-icon" />
          <p class="code-label">{{ $t('orders.showCodeAtCounter') }}</p>
          <p class="code-value">{{ order.code }}</p>
        </div>

        <div class="panel-card items-card">
          <h2>{{ $t('orders.orderSummary') }}</h2>
          <div class="item-row" v-for="item in order.items" :key="item.name">
            <span>{{ item.qty }}× {{ item.name }}</span>
            <span>{{ formatCurrency(item.unitPrice * item.qty + item.extrasTotal) }}</span>
          </div>
          <div class="item-row total-row">
            <span>{{ $t('orders.total') }}</span>
            <span>{{ formatCurrency(order.total) }}</span>
          </div>
        </div>

        <div v-if="order.status === 'ready'" class="ready-banner">
          <ion-icon :icon="checkmarkCircle" />
          {{ $t('orders.readyBanner') }}
        </div>
        <div v-else-if="!canCancel" class="window-closed-note">
          <ion-icon :icon="timeOutline" />
          {{ $t('orders.cancelWindowClosed') }}
        </div>
        <button v-else class="cancel-btn" @click="showCancelAlert = true">
          <ion-icon :icon="closeCircleOutline" />
          {{ $t('orders.cancelOrder') }}
        </button>
      </div>

      <ConfirmDialog
        :is-open="showCancelAlert"
        :icon="closeCircleOutline"
        :title="t('orders.cancelConfirmHeader')"
        :message="t('orders.cancelConfirmMessage')"
        :confirm-text="t('orders.cancelOrder')"
        :cancel-text="t('orders.keepOrder')"
        destructive
        @cancel="showCancelAlert = false"
        @confirm="onConfirmCancelOrder"
      />

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="1600"
        position="top"
        @didDismiss="showToast = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonSkeletonText, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  timeOutline,
  locationOutline,
  cardOutline,
  qrCodeOutline,
  checkmarkCircle,
  ellipseOutline,
  closeCircleOutline,
  receiptOutline,
} from 'ionicons/icons';
import { useOrders, type ActiveOrder, type OrderStatus } from '@/composables/useOrders';
import { supabase } from '@/services/supabase';
import { formatCurrency } from '@/utils/currency';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { fetchOrderById, cancelOrder, canCancelOrder } = useOrders();

const orderId = Number(route.params.id);
const order = ref<ActiveOrder | null>(null);
const loading = ref(true);

async function loadOrder() {
  order.value = await fetchOrderById(orderId);
  loading.value = false;
}

let channel: ReturnType<typeof supabase.channel> | null = null;
const now = ref(Date.now());
let cancelWindowTimer: number | undefined;
onMounted(() => {
  loadOrder();
  channel = supabase
    .channel(`order-tracking-${orderId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () =>
      loadOrder()
    )
    .subscribe();
  cancelWindowTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 30000);
});
onUnmounted(() => {
  if (channel) supabase.removeChannel(channel);
  if (cancelWindowTimer) window.clearInterval(cancelWindowTimer);
});

const steps = computed(() => [
  { key: 'placed', label: t('orders.stepPlaced') },
  { key: 'preparing', label: t('orders.stepPreparing') },
  { key: 'ready', label: t('orders.stepReady') },
  { key: 'picked_up', label: t('orders.stepPickedUp') },
]);

const statusOrder: OrderStatus[] = ['placed', 'preparing', 'ready', 'picked_up'];

const currentStepIndex = computed(() => {
  if (!order.value) return 0;
  const index = statusOrder.indexOf(order.value.status);
  return index === -1 ? 0 : index;
});

function stepClass(i: number) {
  if (i < currentStepIndex.value) return 'done';
  if (i === currentStepIndex.value) return 'active';
  return 'upcoming';
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    placed: t('orders.statusPlaced'),
    preparing: t('orders.statusPreparing'),
    ready: t('orders.statusReady'),
    picked_up: t('orders.statusPickedUp'),
    cancelled: t('orders.statusCancelled'),
  };
  return labels[status];
}

const canCancel = computed(() => {
  void now.value;
  return order.value ? canCancelOrder(order.value) : false;
});

const showCancelAlert = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

async function onConfirmCancelOrder() {
  showCancelAlert.value = false;
  if (!order.value) return;
  try {
    await cancelOrder(order.value.id);
    toastMessage.value = t('orders.orderCancelled');
  } catch {
    toastMessage.value = t('orders.cancelFailed');
  }
  showToast.value = true;
}
</script>

<style scoped>
.tracking-content {
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
  gap: 14px;
}

.panel-card {
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  padding: 18px;
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

.status-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.status-placed {
  background: rgba(91, 141, 239, 0.14);
  color: #5b8def;
}

.status-preparing {
  background: rgba(255, 159, 28, 0.16);
  color: #ff9f1c;
}

.status-ready,
.status-picked_up {
  background: rgba(46, 196, 182, 0.16);
  color: #2ec4b6;
}

.status-cancelled {
  background: rgba(255, 59, 48, 0.14);
  color: #ff3b30;
}

.cancelled-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 59, 48, 0.08);
  color: #ff3b30;
  font-weight: 600;
  font-size: 13px;
}

.stepper {
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 64px;
  flex-shrink: 0;
}

.step span {
  font-size: 10px;
  color: var(--ion-color-medium);
  text-align: center;
}

.step-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--ion-color-step-300, #ccc);
}

.step.done .step-icon {
  color: #2ec4b6;
}

.step.active .step-icon {
  color: #ff6b35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.16);
  border-radius: 50%;
}

.step.done span,
.step.active span {
  color: var(--ion-text-color);
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--ion-color-step-150, #e8e8e8);
  margin-top: 13px;
}

.step-line.done {
  background: #2ec4b6;
}

.pickup-body {
  margin-top: 18px;
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

.code-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

.items-card h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
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

.ready-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: rgba(46, 196, 182, 0.12);
  color: #229c92;
  font-weight: 700;
  font-size: 13px;
  text-align: center;
}

.ready-banner ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.window-closed-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: var(--ion-color-step-100, #eee);
  color: var(--ion-color-medium);
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}

.window-closed-note ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 59, 48, 0.35);
  background: rgba(255, 59, 48, 0.08);
  color: #ff3b30;
  font-weight: 700;
  font-size: 14px;
  transition: transform 0.15s ease;
}

.cancel-btn:active {
  transform: scale(0.97);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-state h3 {
  margin: 0 0 4px;
  color: var(--ion-text-color);
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  transition: transform 0.15s ease;
}

.primary-btn:active {
  transform: scale(0.97);
}
</style>
