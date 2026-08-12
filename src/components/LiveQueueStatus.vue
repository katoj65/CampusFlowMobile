<template>
  <ion-card class="panel-card queue-panel">
    <div class="panel-header">
      <div>
        <h2>{{ $t('dashboard.liveQueueStatus') }}</h2>
        <p class="panel-sub">{{ $t('dashboard.mensaGroundFloor') }}</p>
      </div>
      <span class="live-dot"><span class="live-dot-core"></span>{{ $t('dashboard.live') }}</span>
    </div>

    <div class="queue-summary">
      <span class="queue-level-badge" :class="queueChipClass">
        <ion-icon :icon="peopleOutline" />
        {{ queueLevelLabel }}
      </span>
      <span class="queue-wait">
        <ion-icon :icon="hourglassOutline" />
        {{ t('dashboard.waitMinutes', { minutes: queue.estimateMinutes }) }}
      </span>
    </div>
    <div class="queue-meter-track">
      <div class="queue-meter-fill" :class="queueChipClass" :style="{ width: queueMeterWidth }"></div>
    </div>

    <div class="queue-pickup-row" :class="{ missed: hasMissedPickup }" v-if="currentOrder">
      <ion-icon :icon="hasMissedPickup ? alertCircleOutline : timeOutline" />
      <span class="queue-pickup-slot">{{ t('dashboard.pickupAt', { slot: currentOrder.pickupSlot }) }}</span>
      <span class="queue-pickup-eta" v-if="hasMissedPickup">{{ t('dashboard.missedPickupTime') }}</span>
      <span class="queue-pickup-eta" v-else-if="minutesToPickup !== null">
        {{ t('dashboard.inMinutes', { minutes: minutesToPickup }) }}
      </span>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonCard, IonIcon } from '@ionic/vue';
import { peopleOutline, hourglassOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { useOrders } from '@/composables/useOrders';
import { useQueueStatus } from '@/composables/useQueueStatus';

const { t } = useI18n();
const { queue, queueLevelLabel, queueChipClass, queueMeterWidth } = useQueueStatus();

// The currently active order (placed/preparing/ready) — not order history,
// since a past/cancelled order's pickup time is no longer relevant here.
const { activeOrder } = useOrders();
const currentOrder = computed(() => activeOrder.value);

// Ticks every 30s so the "in X min" countdown and the missed-pickup switch
// stay accurate without requiring a manual refresh.
const now = ref(Date.now());
let clockTimer: number | undefined;
onMounted(() => {
  clockTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 30000);
});
onUnmounted(() => {
  if (clockTimer) window.clearInterval(clockTimer);
});

const pickupDeadline = computed(() => {
  const iso = currentOrder.value?.pickupSlotEndIso;
  return iso ? new Date(iso).getTime() : null;
});

const hasMissedPickup = computed(() => pickupDeadline.value !== null && now.value > pickupDeadline.value);

const minutesToPickup = computed(() => {
  if (pickupDeadline.value === null) return null;
  return Math.max(0, Math.round((pickupDeadline.value - now.value) / 60000));
});
</script>

<style scoped>
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

.queue-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.queue-level-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.queue-level-badge ion-icon {
  font-size: 14px;
}

.queue-level-badge.chip-low {
  background: rgba(46, 196, 182, 0.14);
  color: #229c92;
}

.queue-level-badge.chip-moderate {
  background: rgba(255, 159, 28, 0.16);
  color: #c47712;
}

.queue-level-badge.chip-high {
  background: rgba(255, 59, 48, 0.14);
  color: #d63127;
}

.queue-wait {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.queue-wait ion-icon {
  font-size: 14px;
}

.queue-meter-track {
  margin-top: 10px;
  height: 6px;
  border-radius: 999px;
  background: var(--ion-color-step-150, #e8e8e8);
  overflow: hidden;
}

.queue-meter-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
  background: #ff9f1c;
}

.queue-meter-fill.chip-low {
  background: #2ec4b6;
}

.queue-meter-fill.chip-moderate {
  background: #ff9f1c;
}

.queue-meter-fill.chip-high {
  background: #ff3b30;
}

.queue-pickup-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--ion-color-step-50, #f4f5f8);
  font-size: 13px;
}

.queue-pickup-row ion-icon {
  font-size: 16px;
  color: #ff6b35;
  flex-shrink: 0;
}

.queue-pickup-slot {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-pickup-eta {
  flex-shrink: 0;
  font-weight: 700;
  color: #ff6b35;
}

.queue-pickup-row.missed {
  background: rgba(255, 59, 48, 0.1);
}

.queue-pickup-row.missed ion-icon {
  color: #ff3b30;
}

.queue-pickup-row.missed .queue-pickup-eta {
  color: #ff3b30;
}
</style>
