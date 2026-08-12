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

    <div class="queue-pickup-row" v-if="latestOrder">
      <ion-icon :icon="timeOutline" />
      <span class="queue-pickup-slot">{{ t('dashboard.pickupAt', { slot: latestOrder.pickupSlot }) }}</span>
      <span class="queue-pickup-eta">{{ t('dashboard.inMinutes', { minutes: minutesToPickup }) }}</span>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonCard, IonIcon } from '@ionic/vue';
import { peopleOutline, hourglassOutline, timeOutline } from 'ionicons/icons';
import { useOrders } from '@/composables/useOrders';
import { useQueueStatus } from '@/composables/useQueueStatus';

const { t } = useI18n();
const { queue, queueLevelLabel, queueChipClass, queueMeterWidth } = useQueueStatus();

const { orderHistory } = useOrders();
const latestOrder = computed(() => orderHistory[0] ?? null);

// Mock pickup ETA until this is backed by the real active order's pickup time.
const nextPickup = ref({
  orderId: '10482',
  slotStart: '12:45 PM',
  slotEnd: '1:00 PM',
  location: 'Mensa Ground Floor, Counter 2',
  minutesFromNow: 18,
});
const minutesToPickup = computed(() => nextPickup.value.minutesFromNow);
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
</style>
