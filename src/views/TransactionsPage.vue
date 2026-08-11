<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tx-content">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('wallet.transactions') }}</h1>
      </div>

      <div class="page-body">
        <div class="history-list" v-if="loading">
          <div class="history-row" v-for="i in 4" :key="i">
            <ion-skeleton-text :animated="true" style="width: 38px; height: 38px; border-radius: 50%; margin: 0"></ion-skeleton-text>
            <div class="history-text">
              <ion-skeleton-text :animated="true" style="width: 90px; height: 12px"></ion-skeleton-text>
              <ion-skeleton-text :animated="true" style="width: 130px; height: 10px; margin-top: 6px"></ion-skeleton-text>
            </div>
            <ion-skeleton-text :animated="true" style="width: 50px; height: 14px; margin: 0"></ion-skeleton-text>
          </div>
        </div>

        <div class="empty-state" v-else-if="transactions.length === 0">
          <ion-icon :icon="receiptOutline" />
          <h3>{{ $t('wallet.noTransactions') }}</h3>
          <p>{{ $t('wallet.noTransactionsHint') }}</p>
        </div>

        <div v-else class="tx-groups">
          <section class="tx-group" v-for="group in groupedTransactions" :key="group.label">
            <p class="group-label">{{ group.label }}</p>
            <div class="history-list">
              <div class="history-row" v-for="tx in group.items" :key="tx.id">
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
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent } from '@ionic/vue';
import {
  chevronBackOutline,
  receiptOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline,
  cartOutline,
  cashOutline,
} from 'ionicons/icons';
import { useWallet, type WalletTransaction } from '@/composables/useWallet';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const { t } = useI18n();
const { transactions, loading, fetchWallet } = useWallet();

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

const groupedTransactions = computed(() => {
  const today: WalletTransaction[] = [];
  const earlier: WalletTransaction[] = [];
  for (const tx of transactions) {
    (isToday(tx.created_at) ? today : earlier).push(tx);
  }
  const groups: { label: string; items: WalletTransaction[] }[] = [];
  if (today.length) groups.push({ label: t('wallet.today'), items: today });
  if (earlier.length) groups.push({ label: t('wallet.earlier'), items: earlier });
  return groups;
});

async function onRefresh(event: CustomEvent) {
  await fetchWallet();
  (event.target as HTMLIonRefresherElement).complete();
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
.tx-content {
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
}

.tx-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tx-group {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
