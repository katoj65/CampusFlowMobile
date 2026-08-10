<template>
  <ion-page>
    <ion-content :fullscreen="true" class="location-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('pickupLocation.title') }}</h1>
      </div>

      <div class="page-body">
        <p class="intro">
          {{ $t('pickupLocation.intro') }}
        </p>

        <div class="location-list">
          <button
            class="location-row"
            v-for="location in pickupLocations"
            :key="location.id"
            :class="{ active: selectedLocationId === location.id }"
            @click="onSelect(location)"
          >
            <div class="location-icon">
              <ion-icon :icon="storefrontOutline" />
            </div>
            <div class="location-text">
              <strong>{{ location.name }}</strong>
              <span>{{ location.building }}</span>
              <div class="meta-row">
                <span class="meta-chip">
                  <ion-icon :icon="walkOutline" />
                  {{ location.walkTime }}
                </span>
                <span class="meta-chip">
                  <ion-icon :icon="timeOutline" />
                  {{ location.hours }}
                </span>
              </div>
            </div>
            <ion-icon
              :icon="selectedLocationId === location.id ? checkmarkCircle : ellipseOutline"
              class="check"
            />
          </button>
        </div>

        <p class="disclaimer">
          <ion-icon :icon="informationCircleOutline" />
          {{ $t('pickupLocation.disclaimer') }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  storefrontOutline,
  walkOutline,
  timeOutline,
  checkmarkCircle,
  ellipseOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { usePickupLocation, type PickupLocation } from '@/composables/usePickupLocation';

const router = useRouter();
const { t } = useI18n();
const { pickupLocations, selectedLocationId, setPickupLocation } = usePickupLocation();

const showToast = ref(false);
const toastMessage = ref('');

function onSelect(location: PickupLocation) {
  if (selectedLocationId.value === location.id) return;
  setPickupLocation(location.id);
  toastMessage.value = t('pickupLocation.setAsDefault', { name: location.name });
  showToast.value = true;
}
</script>

<style scoped>
.location-content {
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
  gap: 20px;
}

.intro {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: 1.5px solid transparent;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  text-align: left;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.location-row.active {
  border-color: #ff6b35;
}

.location-icon {
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
  margin-top: 2px;
}

.location-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.location-text strong {
  font-weight: 700;
}

.location-text > span {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--ion-color-step-100, #f0f0f0);
  font-size: 11px;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.meta-chip ion-icon {
  font-size: 12px;
}

.check {
  font-size: 20px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
  margin-top: 2px;
}

.location-row.active .check {
  color: #ff6b35;
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
