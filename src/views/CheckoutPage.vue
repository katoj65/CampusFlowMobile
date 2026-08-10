<template>
  <ion-page>
    <ion-content :fullscreen="true" class="checkout-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('checkout.title') }}</h1>
      </div>

      <div class="page-body">
        <section class="detail-section">
          <h2>
            <ion-icon :icon="timeOutline" />
            {{ $t('checkout.pickupSlot') }}
          </h2>
          <div class="option-row">
            <button
              v-for="slot in pickupSlots"
              :key="slot"
              class="option-chip"
              :class="{ active: selectedSlot === slot }"
              @click="selectedSlot = slot"
            >
              {{ slot }}
            </button>
          </div>
          <p class="section-hint">
            <ion-icon :icon="locationOutline" />
            {{ $t('dashboard.mensaGroundFloor') }}, {{ $t('checkout.counter2') }}
          </p>
        </section>

        <section class="detail-section">
          <h2>
            <ion-icon :icon="cardOutline" />
            {{ $t('checkout.paymentMethod') }}
          </h2>
          <div class="payment-list">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-card"
              :class="{ active: selectedPayment === method.id }"
              @click="selectedPayment = method.id"
            >
              <ion-icon :icon="method.icon" />
              <span class="payment-card-text">
                {{ method.label }}
                <small>{{ method.detail }}</small>
              </span>
              <ion-icon
                :icon="selectedPayment === method.id ? checkmarkCircle : ellipseOutline"
                class="check-icon"
              />
            </button>
          </div>
          <button class="manage-payment-btn" @click="router.push('/payment-methods')">
            {{ $t('checkout.managePaymentMethods') }}
            <ion-icon :icon="chevronForwardOutline" />
          </button>
        </section>

        <section class="detail-section">
          <h2>{{ $t('checkout.orderNotes') }}</h2>
          <textarea
            v-model="notes"
            class="notes-input"
            rows="3"
            :placeholder="$t('checkout.notesPlaceholder')"
          ></textarea>
        </section>

        <section class="detail-section">
          <h2>{{ $t('orders.orderSummary') }}</h2>
          <div class="panel-card summary-card">
            <div class="item-row" v-for="line in cart.lines" :key="line.lineId">
              <span>{{ line.qty }}× {{ line.name }}</span>
              <span>{{ formatCurrency(line.unitPrice * line.qty) }}</span>
            </div>
            <div class="item-row total-row">
              <span>{{ $t('orders.total') }}</span>
              <span>{{ formatCurrency(cart.subtotal.value) }}</span>
            </div>
          </div>
        </section>
      </div>

      <div class="checkout-footer">
        <button class="place-order-btn" @click="onPlaceOrder">
          <span>{{ $t('checkout.placeOrder') }}</span>
          <span>{{ formatCurrency(cart.subtotal.value) }}</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import {
  chevronBackOutline,
  timeOutline,
  locationOutline,
  cardOutline,
  checkmarkCircle,
  ellipseOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useCart } from '@/composables/useCart';
import { useOrders } from '@/composables/useOrders';
import { usePaymentMethods } from '@/composables/usePaymentMethods';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const cart = useCart();
const orders = useOrders();
const { methods: paymentMethods, defaultMethod } = usePaymentMethods();

onMounted(() => {
  if (cart.lines.length === 0) {
    router.replace('/cart');
  }
});

function generatePickupSlots(): string[] {
  const slots: string[] = [];
  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15 + 15, 0, 0);
  for (let i = 0; i < 4; i++) {
    const slotStart = new Date(start.getTime() + i * 15 * 60000);
    const slotEnd = new Date(slotStart.getTime() + 15 * 60000);
    const format = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    slots.push(`${format(slotStart)} – ${format(slotEnd)}`);
  }
  return slots;
}

const pickupSlots = generatePickupSlots();
const selectedSlot = ref(pickupSlots[0]);

const selectedPayment = ref(defaultMethod.value.id);

const notes = ref('');

function onPlaceOrder() {
  if (cart.lines.length === 0) return;
  orders.placeOrder([...cart.lines], selectedSlot.value);
  cart.clearCart();
  router.replace('/order-confirmation');
}
</script>

<style scoped>
.checkout-content {
  --background: var(--ion-color-step-50, #f4f5f8);
  --padding-bottom: 110px;
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

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 6px 16px -14px rgba(0, 0, 0, 0.4);
}

.option-chip.active {
  background: #ff6b35;
  color: #fff;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 1.5px solid transparent;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.payment-card ion-icon:first-child {
  font-size: 20px;
  color: #ff6b35;
}

.payment-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.payment-card-text small {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 500;
  color: var(--ion-color-medium);
}

.check-icon {
  font-size: 18px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
}

.payment-card.active {
  border-color: #ff6b35;
}

.payment-card.active .check-icon {
  color: #ff6b35;
}

.manage-payment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  margin-top: 10px;
  border: none;
  background: none;
  color: var(--ion-color-medium);
  font-size: 12px;
  font-weight: 600;
}

.manage-payment-btn ion-icon {
  font-size: 14px;
}

.notes-input {
  width: 100%;
  border-radius: 16px;
  border: none;
  padding: 12px 14px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 13px;
  font-family: inherit;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  resize: none;
}

.summary-card {
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
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

.checkout-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
}

.place-order-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
}
</style>
