// Mock live queue level — not yet backed by a real counter/kitchen data
// source. Shared (module-level) so the dashboard hero's small queue chip
// and the LiveQueueStatus panel both reflect the same value.
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export interface QueueStatus {
  level: 'Low' | 'Moderate' | 'High';
  levelIndex: number;
  estimateMinutes: number;
}

const queue = ref<QueueStatus>({
  level: 'Moderate',
  levelIndex: 2,
  estimateMinutes: 8,
});

export function useQueueStatus() {
  const { t } = useI18n();

  const queueLevelLabel = computed(() => {
    if (queue.value.level === 'Low') return t('dashboard.queueLow');
    if (queue.value.level === 'High') return t('dashboard.queueHigh');
    return t('dashboard.queueModerate');
  });

  const queueChipClass = computed(() => ({
    'chip-low': queue.value.level === 'Low',
    'chip-moderate': queue.value.level === 'Moderate',
    'chip-high': queue.value.level === 'High',
  }));

  const queueMeterWidth = computed(() => `${(queue.value.levelIndex / 3) * 100}%`);

  return { queue, queueLevelLabel, queueChipClass, queueMeterWidth };
}
