<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pay-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('profile.paymentMethods') }}</h1>
      </div>

      <div class="page-body">
        <div class="wallet-card">
          <div class="wallet-top">
            <ion-icon :icon="walletOutline" />
            <span>{{ $t('payment.campusWallet') }}</span>
          </div>
          <p class="wallet-balance">{{ formatCurrency(walletBalance) }}</p>
          <button class="topup-btn" @click="onTopUp">
            <ion-icon :icon="addCircleOutline" />
            {{ t('payment.topUp', { amount: formatCurrency(10) }) }}
          </button>
        </div>

        <section class="detail-section">
          <h2>{{ $t('payment.savedMethods') }}</h2>
          <div class="method-list">
            <div
              class="method-row"
              v-for="method in methods"
              :key="method.id"
              :class="{ default: method.isDefault }"
              role="button"
              tabindex="0"
              @click="onSelectDefault(method)"
            >
              <div class="method-icon">
                <ion-icon :icon="method.icon" />
              </div>
              <div class="method-text">
                <strong>{{ method.label }}</strong>
                <span>{{ method.detail }}</span>
              </div>
              <span v-if="method.isDefault" class="default-badge">{{ $t('payment.default') }}</span>
              <button
                v-if="method.removable"
                class="remove-btn"
                :aria-label="t('payment.removeMethodAria')"
                @click.stop="onRemove(method)"
              >
                <ion-icon :icon="trashOutline" />
              </button>
            </div>
          </div>

          <button class="add-card-btn" v-if="!showAddForm" @click="showAddForm = true">
            <ion-icon :icon="addCircleOutline" />
            {{ $t('payment.addACard') }}
          </button>

          <div class="add-card-form" v-else>
            <input
              v-model="cardNumber"
              class="form-input"
              :placeholder="$t('payment.cardNumber')"
              inputmode="numeric"
              maxlength="19"
              @input="onCardNumberInput"
            />
            <input v-model="cardName" class="form-input" :placeholder="$t('payment.nameOnCard')" />
            <input v-model="cardExpiry" class="form-input" placeholder="MM/YY" maxlength="5" @input="onExpiryInput" />
            <div class="form-actions">
              <button class="cancel-form-btn" @click="cancelAddForm">{{ $t('profile.cancel') }}</button>
              <button class="save-card-btn" :disabled="!canSaveCard" @click="onSaveCard">{{ $t('payment.saveCard') }}</button>
            </div>
          </div>
        </section>

        <p class="disclaimer">
          <ion-icon :icon="informationCircleOutline" />
          {{ $t('payment.demoDisclaimer') }}
        </p>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="1400"
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
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  walletOutline,
  addCircleOutline,
  trashOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { usePaymentMethods, type PaymentMethod } from '@/composables/usePaymentMethods';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const { t } = useI18n();
const { methods, walletBalance, setDefault, removeMethod, addCard, topUpWallet } = usePaymentMethods();

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

function onSelectDefault(method: PaymentMethod) {
  if (method.isDefault) return;
  setDefault(method.id);
  notify(t('payment.setAsDefault', { label: method.label }));
}

function onRemove(method: PaymentMethod) {
  removeMethod(method.id);
  notify(t('payment.removed', { label: method.label }));
}

function onTopUp() {
  topUpWallet(10);
  notify(t('payment.addedToWallet', { amount: formatCurrency(10) }));
}

const showAddForm = ref(false);
const cardNumber = ref('');
const cardName = ref('');
const cardExpiry = ref('');

function onCardNumberInput() {
  const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
  cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
}

function onExpiryInput() {
  const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
  cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

const canSaveCard = computed(() => {
  const digits = cardNumber.value.replace(/\D/g, '');
  return digits.length >= 12 && cardName.value.trim().length > 0 && /^\d{2}\/\d{2}$/.test(cardExpiry.value);
});

function cancelAddForm() {
  showAddForm.value = false;
  cardNumber.value = '';
  cardName.value = '';
  cardExpiry.value = '';
}

function onSaveCard() {
  if (!canSaveCard.value) return;
  addCard(cardNumber.value, cardName.value);
  notify(t('payment.cardAdded'));
  cancelAddForm();
}
</script>

<style scoped>
.pay-content {
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
  gap: 22px;
}

.wallet-card {
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, #2b2118 0%, #6b3f26 45%, #ff6b35 100%);
  color: #fff;
}

.wallet-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.wallet-top ion-icon {
  font-size: 18px;
}

.wallet-balance {
  margin: 10px 0 16px;
  font-size: 32px;
  font-weight: 800;
}

.topup-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  border: 1.5px solid transparent;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.method-row.default {
  border-color: #ff6b35;
}

.method-icon {
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

.method-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.method-text strong {
  font-weight: 700;
}

.method-text span {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.default-badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
  font-size: 10px;
  font-weight: 700;
}

.remove-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.add-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: 1.5px dashed var(--ion-color-step-200, #ddd);
  border-radius: 16px;
  background: none;
  color: #ff6b35;
  font-weight: 700;
  font-size: 13px;
}

.add-card-form {
  margin-top: 10px;
  padding: 14px;
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 13px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.cancel-form-btn {
  flex: 1;
  padding: 11px;
  border-radius: 12px;
  border: none;
  background: var(--ion-color-step-100, #eee);
  color: var(--ion-color-medium);
  font-weight: 600;
  font-size: 13px;
}

.save-card-btn {
  flex: 1;
  padding: 11px;
  border-radius: 12px;
  border: none;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
}

.save-card-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--ion-color-step-100, #ececec);
  font-size: 11px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.disclaimer ion-icon {
  font-size: 16px;
  margin-top: 1px;
  flex-shrink: 0;
}
</style>
