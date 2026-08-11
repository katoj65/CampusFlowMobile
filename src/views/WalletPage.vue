<template>
  <ion-page>
    <ion-content :fullscreen="true" class="wallet-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('wallet.title') }}</h1>
      </div>

      <div class="page-body">
        <div class="wallet-card">
          <div class="wallet-top">
            <ion-icon :icon="walletOutline" />
            <span>{{ $t('wallet.availableBalance') }}</span>
          </div>
          <p class="wallet-balance">{{ formatCurrency(balance) }}</p>
          <div class="wallet-actions">
            <button class="wallet-action-btn" :class="{ active: mode === 'topup' }" @click="setMode('topup')">
              <ion-icon :icon="addCircleOutline" />
              {{ $t('wallet.addMoney') }}
            </button>
            <button class="wallet-action-btn" :class="{ active: mode === 'withdraw' }" @click="setMode('withdraw')">
              <ion-icon :icon="removeCircleOutline" />
              {{ $t('wallet.withdraw') }}
            </button>
          </div>
        </div>

        <section class="detail-section" v-if="mode">
          <h2>{{ mode === 'topup' ? $t('wallet.addMoney') : $t('wallet.withdraw') }}</h2>
          <div class="panel-card amount-panel">
            <p class="quick-label">{{ $t('wallet.selectCard') }}</p>
            <div class="source-toggle">
              <button
                class="source-toggle-btn"
                :class="{ active: cardSource === 'saved' }"
                :disabled="cardMethods.length === 0"
                @click="setCardSource('saved')"
              >
                <ion-icon :icon="cardOutline" />
                {{ $t('wallet.savedCard') }}
              </button>
              <button class="source-toggle-btn" :class="{ active: cardSource === 'new' }" @click="setCardSource('new')">
                <ion-icon :icon="addCircleOutline" />
                {{ $t('wallet.newCard') }}
              </button>
            </div>

            <div v-if="cardSource === 'saved'" class="card-select-list">
              <button
                v-for="card in cardMethods"
                :key="card.id"
                class="card-select-row"
                :class="{ active: selectedCardId === card.id }"
                @click="selectedCardId = card.id"
              >
                <ion-icon :icon="cardOutline" />
                <span class="card-select-text">
                  {{ card.label }}
                  <small>{{ card.detail }}</small>
                </span>
                <ion-icon :icon="selectedCardId === card.id ? checkmarkCircle : ellipseOutline" class="check-icon" />
              </button>
            </div>

            <div v-else class="new-card-form">
              <input
                v-model="newCardNumber"
                class="form-input"
                :placeholder="$t('payment.cardNumber')"
                inputmode="numeric"
                maxlength="19"
                @input="newCardNumber = formatCardNumberInput(newCardNumber)"
              />
              <input v-model="newCardName" class="form-input" :placeholder="$t('payment.nameOnCard')" />
              <input
                v-model="newCardExpiry"
                class="form-input"
                placeholder="MM/YY"
                maxlength="5"
                @input="newCardExpiry = formatExpiryInput(newCardExpiry)"
              />
            </div>

            <p class="quick-label">{{ $t('wallet.quickAmounts') }}</p>
            <div class="option-row">
              <button
                v-for="preset in presetAmounts"
                :key="preset"
                class="option-chip"
                :class="{ active: amount === String(preset) }"
                @click="amount = String(preset)"
              >
                {{ formatCurrency(preset) }}
              </button>
            </div>
            <input
              v-model="amount"
              class="amount-input"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              :placeholder="$t('wallet.amountPlaceholder')"
            />
            <button class="confirm-btn" :disabled="!canConfirm || submitting" @click="onConfirm">
              <ion-spinner v-if="submitting" name="crescent" />
              <span v-else>{{ $t('wallet.confirm') }}</span>
            </button>
          </div>
        </section>

        <section class="detail-section">
          <h2>{{ $t('wallet.history') }}</h2>
          <div v-if="transactions.length === 0" class="empty-state">
            <ion-icon :icon="receiptOutline" />
            <p>{{ $t('wallet.noTransactions') }}</p>
            <span>{{ $t('wallet.noTransactionsHint') }}</span>
          </div>
          <div class="panel-card history-list" v-else>
            <div class="history-row" v-for="tx in transactions" :key="tx.id">
              <div class="history-icon" :class="tx.type">
                <ion-icon :icon="iconForType(tx.type)" />
              </div>
              <div class="history-text">
                <strong>{{ $t(`wallet.types.${tx.type}`) }}</strong>
                <span>{{ formatDate(tx.created_at) }}<template v-if="tx.source_label"> · {{ tx.source_label }}</template></span>
              </div>
              <span class="history-amount" :class="{ negative: tx.type === 'withdrawal' || tx.type === 'payment' }">
                {{ tx.type === 'withdrawal' || tx.type === 'payment' ? '−' : '+' }}{{ formatCurrency(tx.amount) }}
              </span>
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast, IonSpinner } from '@ionic/vue';
import {
  chevronBackOutline,
  walletOutline,
  addCircleOutline,
  removeCircleOutline,
  receiptOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline,
  cartOutline,
  cashOutline,
  cardOutline,
  checkmarkCircle,
  ellipseOutline,
} from 'ionicons/icons';
import { useWallet } from '@/composables/useWallet';
import { usePaymentMethods } from '@/composables/usePaymentMethods';
import { formatCurrency } from '@/utils/currency';
import { formatCardNumberInput, formatExpiryInput, isValidCardEntry } from '@/utils/card';

const router = useRouter();
const { t } = useI18n();
const { balance, transactions, topUp, withdraw } = useWallet();
const { methods: paymentMethods, addCard } = usePaymentMethods();

const cardMethods = computed(() => paymentMethods.filter((m) => m.type === 'card'));
const selectedCardId = ref<string | null>(null);

const cardSource = ref<'saved' | 'new'>('saved');
const newCardNumber = ref('');
const newCardName = ref('');
const newCardExpiry = ref('');

const mode = ref<'topup' | 'withdraw' | null>(null);
const amount = ref('');
const submitting = ref(false);

const presetAmounts = [5, 10, 20, 50];

function setCardSource(source: 'saved' | 'new') {
  cardSource.value = source;
  selectedCardId.value = source === 'saved' ? cardMethods.value[0]?.id ?? null : null;
}

function resetCardSelection() {
  newCardNumber.value = '';
  newCardName.value = '';
  newCardExpiry.value = '';
  setCardSource(cardMethods.value.length > 0 ? 'saved' : 'new');
}

function setMode(next: 'topup' | 'withdraw') {
  mode.value = mode.value === next ? null : next;
  amount.value = '';
  resetCardSelection();
}

const parsedAmount = computed(() => Number(amount.value));
const newCardValid = computed(() => isValidCardEntry(newCardNumber.value, newCardName.value, newCardExpiry.value));
const canConfirm = computed(() => {
  if (amount.value.trim().length === 0 || parsedAmount.value <= 0) return false;
  return cardSource.value === 'new' ? newCardValid.value : selectedCardId.value !== null;
});

const showToast = ref(false);
const toastMessage = ref('');
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onConfirm() {
  if (!canConfirm.value || !mode.value) return;
  submitting.value = true;
  try {
    let cardId = selectedCardId.value;
    if (cardSource.value === 'new') {
      const saved = await addCard(newCardNumber.value, newCardName.value);
      cardId = saved.id;
    }
    if (!cardId) return;

    if (mode.value === 'topup') {
      await topUp(parsedAmount.value, cardId);
      notify(t('wallet.topUpSuccess', { amount: formatCurrency(parsedAmount.value) }));
    } else {
      await withdraw(parsedAmount.value, cardId);
      notify(t('wallet.withdrawSuccess', { amount: formatCurrency(parsedAmount.value) }));
    }
    mode.value = null;
    amount.value = '';
    resetCardSelection();
  } catch (err) {
    notify(err instanceof Error ? err.message : t('wallet.invalidAmount'));
  } finally {
    submitting.value = false;
  }
}

function iconForType(type: string): string {
  switch (type) {
    case 'top_up':
      return arrowUpCircleOutline;
    case 'withdrawal':
      return arrowDownCircleOutline;
    case 'payment':
      return cartOutline;
    default:
      return cashOutline;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
</script>

<style scoped>
.wallet-content {
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
  background: #fdeee1;
  color: #2b2118;
}

.wallet-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(43, 33, 24, 0.65);
}

.wallet-top ion-icon {
  font-size: 18px;
  color: #ff6b35;
}

.wallet-balance {
  margin: 10px 0 16px;
  font-size: 32px;
  font-weight: 800;
}

.wallet-actions {
  display: flex;
  gap: 10px;
}

.wallet-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border: 1.5px solid rgba(43, 33, 24, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #2b2118;
  font-weight: 600;
  font-size: 13px;
}

.wallet-action-btn.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: #fff;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.amount-panel {
  padding: 16px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 12px;
  font-weight: 600;
}

.option-chip.active {
  background: #ff6b35;
  color: #fff;
}

.source-toggle {
  display: flex;
  gap: 8px;
}

.source-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 13px;
  font-weight: 600;
}

.source-toggle-btn.active {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.06);
  color: #ff6b35;
}

.source-toggle-btn:disabled {
  opacity: 0.45;
}

.card-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-select-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 13px;
  font-weight: 600;
}

.card-select-row ion-icon:first-child {
  font-size: 17px;
  color: #ff6b35;
  flex-shrink: 0;
}

.card-select-row.active {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.06);
}

.card-select-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.card-select-text small {
  margin-top: 1px;
  font-size: 11px;
  font-weight: 500;
  color: var(--ion-color-medium);
}

.check-icon {
  font-size: 17px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
}

.card-select-row.active .check-icon {
  color: #ff6b35;
}

.new-card-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.amount-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  font-size: 15px;
  font-family: inherit;
}

.amount-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  min-height: 46px;
}

.confirm-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}

.confirm-btn ion-spinner {
  width: 18px;
  height: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 32px 16px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.empty-state ion-icon {
  font-size: 32px;
  color: var(--ion-color-step-300, #ccc);
  margin-bottom: 6px;
}

.empty-state p {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
}

.empty-state span {
  font-size: 12px;
  color: var(--ion-color-medium);
  max-width: 240px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.history-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.history-row:last-child {
  border-bottom: none;
}

.history-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
}

.history-icon.withdrawal,
.history-icon.payment {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.history-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.history-text strong {
  font-weight: 700;
}

.history-text span {
  margin-top: 2px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.history-amount {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 14px;
  color: #2f9e5b;
}

.history-amount.negative {
  color: #ff3b30;
}
</style>
