<template>
  <ion-page>
    <ion-content :fullscreen="true" class="cart-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('cart.title') }}</h1>
      </div>

      <div class="page-body" v-if="!cart.loaded.value">
        <div class="cart-list">
          <div class="panel-card cart-line" v-for="i in 2" :key="i">
            <ion-skeleton-text :animated="true" class="image-skeleton"></ion-skeleton-text>
            <div class="cart-line-body">
              <ion-skeleton-text :animated="true" style="width: 70%; height: 14px"></ion-skeleton-text>
              <div class="cart-line-footer">
                <ion-skeleton-text :animated="true" style="width: 40%; height: 14px; margin-top: 10px"></ion-skeleton-text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-body" v-else-if="cart.lines.length">
        <div class="cart-list">
          <div class="panel-card cart-line" v-for="line in cart.lines" :key="line.lineId">
            <img :src="line.image" :alt="line.name" class="cart-line-image" />
            <div class="cart-line-body">
              <h4>{{ line.name }}</h4>
              <p v-if="line.summary" class="cart-line-summary">{{ line.summary }}</p>
              <div class="cart-line-footer">
                <span class="cart-line-price">{{ formatCurrency(line.unitPrice * line.qty + line.extrasTotal) }}</span>
                <div class="cart-line-actions">
                  <div class="mini-stepper">
                    <button @click="onUpdateQty(line.lineId, line.qty - 1)" :disabled="line.qty <= 1">
                      <ion-icon :icon="removeOutline" />
                    </button>
                    <span>{{ line.qty }}</span>
                    <button @click="onUpdateQty(line.lineId, line.qty + 1)" :disabled="line.qty >= 10">
                      <ion-icon :icon="addOutline" />
                    </button>
                  </div>
                  <button class="remove-btn" :aria-label="$t('cart.removeItem')" @click="onRemoveLine(line.lineId)">
                    <ion-icon :icon="trashOutline" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card summary-card">
          <div class="summary-row">
            <span>{{ $t('cart.subtotal') }}</span>
            <span>{{ formatCurrency(cart.subtotal.value) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('cart.pickupFee') }}</span>
            <span class="free-tag">{{ $t('cart.free') }}</span>
          </div>
          <div class="summary-row total-row">
            <span>{{ $t('orders.total') }}</span>
            <span>{{ formatCurrency(cart.subtotal.value) }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <ion-icon :icon="cartOutline" />
        <h3>{{ $t('cart.emptyTitle') }}</h3>
        <p>{{ $t('cart.emptyHint') }}</p>
        <button class="primary-btn" @click="router.push('/tabs/tab2')">{{ $t('orders.browseMenu') }}</button>
      </div>

      <div class="cart-footer" slot="fixed" v-if="cart.lines.length">
        <button class="checkout-btn" @click="router.push('/checkout')">
          <span>{{ $t('cart.proceedToCheckout') }}</span>
          <span>{{ formatCurrency(cart.subtotal.value) }}</span>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast, IonSkeletonText } from '@ionic/vue';
import { chevronBackOutline, removeOutline, addOutline, trashOutline, cartOutline } from 'ionicons/icons';
import { useCart } from '@/composables/useCart';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const { t } = useI18n();
const cart = useCart();

const showToast = ref(false);
const toastMessage = ref('');
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onUpdateQty(lineId: string, qty: number) {
  try {
    await cart.updateQty(lineId, qty);
  } catch {
    notify(t('cart.updateFailed'));
  }
}

async function onRemoveLine(lineId: string) {
  try {
    await cart.removeLine(lineId);
  } catch {
    notify(t('cart.removeFailed'));
  }
}
</script>

<style scoped>
.cart-content {
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
  gap: 16px;
}

.panel-card {
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-line {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.cart-line-image {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

.image-skeleton {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  flex-shrink: 0;
  margin: 0;
}

.cart-line-body {
  flex: 1;
  min-width: 0;
}

.cart-line-body h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.cart-line-summary {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.cart-line-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.cart-line-price {
  font-size: 14px;
  font-weight: 700;
}

.cart-line-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-stepper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--ion-color-step-50, #f4f5f8);
  border-radius: 999px;
  padding: 4px 8px;
}

.mini-stepper button {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--ion-card-background, #fff);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.mini-stepper button:disabled {
  color: var(--ion-color-medium);
  opacity: 0.5;
}

.mini-stepper span {
  font-size: 12px;
  font-weight: 700;
  min-width: 12px;
  text-align: center;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.summary-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.free-tag {
  color: #2ec4b6;
  font-weight: 700;
}

.total-row {
  padding-top: 10px;
  border-top: 1.5px solid var(--ion-color-step-150, #e8e8e8);
  font-size: 15px;
  font-weight: 700;
  color: var(--ion-text-color);
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
  margin: 0 0 16px;
  font-size: 13px;
}

.primary-btn {
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.cart-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
}

.checkout-btn {
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
