<template>
  <ion-page>
    <ion-content :fullscreen="true" class="adverts-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('adverts.title') }}</h1>
      </div>

      <div class="page-body">
        <div class="toggle-card">
          <div class="toggle-icon">
            <ion-icon :icon="megaphoneOutline" />
          </div>
          <div class="toggle-text">
            <strong>{{ $t('adverts.showOnDashboard') }}</strong>
            <span>{{ $t('adverts.showOnDashboardHint') }}</span>
          </div>
          <ion-toggle
            :checked="advertsEnabled"
            :aria-label="$t('adverts.showOnDashboard')"
            @ionChange="onToggle(($event.target as HTMLIonToggleElement).checked)"
          ></ion-toggle>
        </div>

        <section class="detail-section">
          <h2>{{ $t('adverts.allAdverts') }}</h2>

          <div v-if="!listLoaded" class="advert-list">
            <div class="advert-row" v-for="i in 3" :key="i">
              <ion-skeleton-text :animated="true" style="width: 56px; height: 56px; border-radius: 14px; margin: 0"></ion-skeleton-text>
              <div class="advert-row-body">
                <ion-skeleton-text :animated="true" style="width: 70%; height: 14px"></ion-skeleton-text>
                <ion-skeleton-text :animated="true" style="width: 40%; height: 11px; margin-top: 8px"></ion-skeleton-text>
              </div>
            </div>
          </div>

          <div v-else-if="adverts.length" class="advert-list">
            <div class="advert-row" v-for="advert in adverts" :key="advert.id">
              <img v-if="advert.meal" :src="advert.meal.image" :alt="advert.meal.name" class="advert-thumb" />
              <div v-else class="advert-thumb advert-thumb-fallback">
                <ion-icon :icon="megaphoneOutline" />
              </div>
              <div class="advert-row-body">
                <div class="advert-row-top">
                  <h3>{{ advert.title }}</h3>
                  <span class="status-badge" :class="`status-${advert.status}`">{{ statusLabel(advert.status) }}</span>
                </div>
                <p v-if="advert.description" class="advert-description">{{ advert.description }}</p>
                <span class="advert-dates">{{ formatDateRange(advert.fromDate, advert.toDate) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <ion-icon :icon="megaphoneOutline" />
            <h3>{{ $t('adverts.noAdverts') }}</h3>
            <p>{{ $t('adverts.noAdvertsHint') }}</p>
          </div>
        </section>
      </div>

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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToggle, IonSkeletonText, IonToast } from '@ionic/vue';
import { chevronBackOutline, megaphoneOutline } from 'ionicons/icons';
import { useAdverts, type Advert } from '@/composables/useAdverts';

const router = useRouter();
const { t } = useI18n();
const { adverts, listLoaded, advertsEnabled, setAdvertsEnabled, fetchAllAdverts } = useAdverts();

onMounted(() => {
  if (!listLoaded.value) fetchAllAdverts();
});

const showToast = ref(false);
const toastMessage = ref('');
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onToggle(enabled: boolean) {
  try {
    await setAdvertsEnabled(enabled);
  } catch {
    notify(t('adverts.updateFailed'));
  }
}

function statusLabel(status: Advert['status']) {
  const labels: Record<Advert['status'], string> = {
    active: t('adverts.statusActive'),
    draft: t('adverts.statusDraft'),
    expired: t('adverts.statusExpired'),
  };
  return labels[status];
}

function formatDateRange(fromIso: string, toIso: string): string {
  const format = (iso: string) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${format(fromIso)} – ${format(toIso)}`;
}
</script>

<style scoped>
.adverts-content {
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
  gap: 24px;
}

.toggle-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.toggle-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
  background: rgba(46, 196, 182, 0.14);
  color: #2ec4b6;
}

.toggle-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 600;
}

.toggle-text span {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ion-color-medium);
}

ion-toggle {
  --background-checked: rgba(46, 196, 182, 0.35);
  --handle-background-checked: #2ec4b6;
  flex-shrink: 0;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.advert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.advert-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.advert-thumb {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

.advert-thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(46, 196, 182, 0.12);
  color: #2ec4b6;
}

.advert-row-body {
  flex: 1;
  min-width: 0;
}

.advert-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.advert-row-top h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.status-badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-active {
  background: rgba(46, 196, 182, 0.16);
  color: #229c92;
}

.status-draft {
  background: var(--ion-color-step-100, #eee);
  color: var(--ion-color-medium);
}

.status-expired {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
}

.advert-description {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ion-color-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.advert-dates {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ion-color-step-400, #999);
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
