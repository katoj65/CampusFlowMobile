<template>
  <ion-page>
    <ion-content :fullscreen="true" class="orders-content">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="sticky-header">
        <div class="page-header">
          <h1>{{ $t('nav.orders') }}</h1>
          <p class="page-sub">{{ $t('orders.pageSub') }}</p>
        </div>

        <div class="segment-wrap">
          <ion-segment v-model="activeSegment" class="orders-segment" mode="ios">
            <ion-segment-button value="active">
              <ion-label>{{ activeLabel }}</ion-label>
            </ion-segment-button>
            <ion-segment-button value="history">
              <ion-label>{{ historyLabel }}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
      </div>

      <div class="segment-body">
        <template v-if="activeSegment === 'active'">
          <div v-if="activeOrder" class="active-order">
            <div class="panel-card order-status-card">
              <div class="panel-header">
                <div>
                  <h2>{{ t('dashboard.orderNumber', { id: activeOrder.id }) }}</h2>
                  <p class="panel-sub">{{ t('orders.placedAt', { time: activeOrder.placedAt }) }}</p>
                </div>
                <span class="status-badge" :class="`status-${activeOrder.status}`">
                  {{ statusLabel(activeOrder.status) }}
                </span>
              </div>

              <div class="stepper">
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
                  <span>{{ activeOrder.pickupSlot }}</span>
                </div>
                <div class="pickup-location">
                  <ion-icon :icon="locationOutline" />
                  <span>{{ activeOrder.location }}</span>
                </div>
                <div class="pickup-location">
                  <ion-icon :icon="cardOutline" />
                  <span>{{ activeOrder.paymentMethod }}</span>
                </div>
              </div>

              <button class="track-link" @click="router.push(`/order-tracking/${activeOrder.id}`)">
                {{ $t('confirmation.trackOrder') }}
                <ion-icon :icon="chevronForwardOutline" />
              </button>
            </div>

            <div class="panel-card code-card">
              <ion-icon :icon="qrCodeOutline" class="code-icon" />
              <p class="code-label">{{ $t('orders.showCodeAtCounter') }}</p>
              <p class="code-value">{{ activeOrder.code }}</p>
            </div>

            <div class="panel-card items-card">
              <h2>{{ $t('orders.orderSummary') }}</h2>
              <div class="item-row" v-for="item in activeOrder.items" :key="item.name">
                <span>{{ item.qty }}× {{ item.name }}</span>
                <span>{{ formatCurrency(item.price * item.qty) }}</span>
              </div>
              <div class="item-row total-row">
                <span>{{ $t('orders.total') }}</span>
                <span>{{ formatCurrency(activeOrder.total) }}</span>
              </div>
            </div>

            <div v-if="activeOrder.status === 'ready'" class="ready-banner">
              <ion-icon :icon="checkmarkCircle" />
              {{ $t('orders.readyBanner') }}
            </div>
            <button v-else class="cancel-btn" @click="showCancelAlert = true">
              <ion-icon :icon="closeCircleOutline" />
              {{ $t('orders.cancelOrder') }}
            </button>
          </div>

          <div v-else class="empty-state">
            <ion-icon :icon="receiptOutline" />
            <h3>{{ $t('orders.noActiveOrders') }}</h3>
            <p>{{ $t('orders.browseMenuHint') }}</p>
            <button class="primary-btn" @click="goToMenu">{{ $t('orders.browseMenu') }}</button>
          </div>
        </template>

        <template v-else>
          <div v-if="orderHistory.length" class="history-list">
            <section class="history-group" v-for="group in groupedHistory" :key="group.label">
              <p class="group-label">{{ group.label }}</p>
              <div class="history-card" v-for="order in group.items" :key="order.id">
                <div class="history-card-body">
                  <div class="history-top">
                    <div class="history-id-badge">
                      <ion-icon :icon="bagHandleOutline" />
                    </div>
                    <div class="history-heading">
                      <h2>{{ t('dashboard.orderNumber', { id: order.id }) }}</h2>
                      <p class="panel-sub">{{ order.date }}</p>
                    </div>
                    <span class="status-badge" :class="`status-${order.status}`">
                      {{ statusLabel(order.status) }}
                    </span>
                  </div>

                  <div class="history-items-list">
                    <div class="history-item-row" v-for="item in order.items" :key="item.name">
                      <span class="history-item-qty">{{ item.qty }}×</span>
                      <span class="history-item-name">{{ item.name }}</span>
                      <span class="history-item-price">{{ formatCurrency(item.price * item.qty) }}</span>
                    </div>
                  </div>

                  <div class="history-footer">
                    <div class="history-payment">
                      <ion-icon :icon="cardOutline" />
                      <span>{{ order.paymentMethod }}</span>
                    </div>
                    <span class="history-total">{{ formatCurrency(order.total) }}</span>
                  </div>

                  <button class="reorder-btn" @click="onReorder(order)">
                    <ion-icon :icon="refreshOutline" />
                    {{ $t('orders.reorder') }}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div v-else class="empty-state">
            <ion-icon :icon="receiptOutline" />
            <h3>{{ $t('orders.noPastOrders') }}</h3>
            <p>{{ $t('orders.historyHint') }}</p>
            <button class="primary-btn" @click="goToMenu">{{ $t('orders.browseMenu') }}</button>
          </div>
        </template>
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToast,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import {
  timeOutline,
  locationOutline,
  cardOutline,
  qrCodeOutline,
  checkmarkCircle,
  ellipseOutline,
  closeCircleOutline,
  receiptOutline,
  refreshOutline,
  bagHandleOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useOrders, type OrderStatus, type PastOrder } from '@/composables/useOrders';
import { useCart } from '@/composables/useCart';
import { useMenu } from '@/composables/useMenu';
import { formatCurrency } from '@/utils/currency';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const { t } = useI18n();
const { activeOrder, orderHistory, cancelActiveOrder, fetchOrders } = useOrders();
const cart = useCart();
const { meals: menuItems } = useMenu();

const activeSegment = ref<'active' | 'history'>('active');

const activeLabel = computed(() => (activeOrder.value ? t('orders.activeWithCount') : t('orders.active')));
const historyLabel = computed(() =>
  orderHistory.length ? t('orders.historyWithCount', { count: orderHistory.length }) : t('orders.history')
);

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

const groupedHistory = computed(() => {
  const today: PastOrder[] = [];
  const earlier: PastOrder[] = [];
  for (const order of orderHistory) {
    (isToday(order.placedAt) ? today : earlier).push(order);
  }
  const groups: { label: string; items: PastOrder[] }[] = [];
  if (today.length) groups.push({ label: t('orders.today'), items: today });
  if (earlier.length) groups.push({ label: t('orders.earlier'), items: earlier });
  return groups;
});

async function onRefresh(event: CustomEvent) {
  await fetchOrders();
  (event.target as HTMLIonRefresherElement).complete();
}

const steps = computed(() => [
  { key: 'placed', label: t('orders.stepPlaced') },
  { key: 'preparing', label: t('orders.stepPreparing') },
  { key: 'ready', label: t('orders.stepReady') },
  { key: 'picked_up', label: t('orders.stepPickedUp') },
]);

const statusOrder: OrderStatus[] = ['placed', 'preparing', 'ready', 'picked_up'];

const currentStepIndex = computed(() => {
  if (!activeOrder.value) return 0;
  const index = statusOrder.indexOf(activeOrder.value.status);
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

function goToMenu() {
  router.push('/tabs/tab2');
}

const showToast = ref(false);
const toastMessage = ref('');

async function onReorder(order: PastOrder) {
  // meal_id is a real foreign key now, so only items we can still match
  // against the current catalog can be re-added.
  const matched = order.items
    .map((item) => ({ item, meal: menuItems.find((m) => item.name.startsWith(m.name)) }))
    .filter((entry): entry is { item: (typeof order.items)[number]; meal: (typeof menuItems)[number] } => !!entry.meal);

  if (matched.length === 0) {
    toastMessage.value = t('orders.reorderFailed');
    showToast.value = true;
    return;
  }

  try {
    await Promise.all(
      matched.map(({ item, meal }) =>
        cart.addToCart({
          mealId: meal.id,
          name: item.name,
          image: meal.image,
          unitPrice: item.price,
          qty: item.qty,
          summary: '',
        })
      )
    );
    toastMessage.value = t('orders.itemsAddedToCart', { count: matched.length }, matched.length);
    showToast.value = true;
    setTimeout(() => router.push('/cart'), 500);
  } catch {
    toastMessage.value = t('orders.reorderFailed');
    showToast.value = true;
  }
}

const showCancelAlert = ref(false);

async function onConfirmCancelOrder() {
  showCancelAlert.value = false;
  try {
    await cancelActiveOrder();
    toastMessage.value = t('orders.orderCancelled');
  } catch {
    toastMessage.value = t('orders.cancelFailed');
  }
  showToast.value = true;
}
</script>

<style scoped>
.orders-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--ion-color-step-50, #f4f5f8);
}

.page-header {
  padding: calc(20px + env(safe-area-inset-top)) 16px 4px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.page-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.segment-wrap {
  padding: 12px 16px;
}

.orders-segment {
  --background: var(--ion-color-step-100, #e9eaee);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 24px -18px rgba(0, 0, 0, 0.4);
}

.orders-segment ion-segment-button {
  --color: var(--ion-color-medium);
  --color-checked: #fff;
  --indicator-color: #ff6b35;
  --indicator-box-shadow: 0 4px 10px -2px rgba(255, 107, 53, 0.55);
  --border-radius: 9px;
  min-height: 40px;
  font-weight: 600;
  text-transform: none;
  font-size: 13px;
  letter-spacing: 0;
}

.segment-body {
  padding: 4px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.active-order,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  margin: 0 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ion-color-medium);
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

.status-ready {
  background: rgba(46, 196, 182, 0.16);
  color: #2ec4b6;
}

.status-picked_up {
  background: rgba(46, 196, 182, 0.16);
  color: #2ec4b6;
}

.status-cancelled {
  background: rgba(255, 59, 48, 0.14);
  color: #ff3b30;
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

.track-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  margin-top: 16px;
  padding: 11px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 107, 53, 0.08);
  color: #ff6b35;
  font-weight: 700;
  font-size: 13px;
  transition: transform 0.15s ease;
}

.track-link ion-icon {
  font-size: 15px;
}

.track-link:active {
  transform: scale(0.97);
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

.history-card {
  display: flex;
  background: var(--ion-card-background, #fff);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 14px 34px -22px rgba(0, 0, 0, 0.45);
  border: 1px solid var(--ion-color-step-100, rgba(0, 0, 0, 0.04));
}

.history-card-body {
  flex: 1;
  min-width: 0;
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.history-id-badge {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.history-heading {
  flex: 1;
  min-width: 0;
}

.history-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.history-items-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 0;
  border-top: 1px solid var(--ion-color-step-100, #f0f0f0);
  border-bottom: 1px solid var(--ion-color-step-100, #f0f0f0);
}

.history-item-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
}

.history-item-qty {
  flex-shrink: 0;
  color: var(--ion-color-medium);
  font-weight: 600;
}

.history-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-price {
  flex-shrink: 0;
  color: var(--ion-color-medium);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-payment {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.history-payment ion-icon {
  font-size: 14px;
}

.history-total {
  font-size: 17px;
  font-weight: 800;
}

.reorder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  border: 1.5px solid rgba(255, 107, 53, 0.3);
  background: rgba(255, 107, 53, 0.08);
  color: #ff6b35;
  font-weight: 700;
  font-size: 13px;
  padding: 10px;
  border-radius: 12px;
  transition: transform 0.15s ease, background 0.15s ease;
}

.reorder-btn:active {
  transform: scale(0.97);
  background: rgba(255, 107, 53, 0.16);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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
</style>
