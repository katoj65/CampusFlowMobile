<template>
  <ion-page>
    <ion-content :fullscreen="true" class="language-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('language.title') }}</h1>
      </div>

      <div class="page-body">
        <p class="intro">
          {{ $t('language.intro') }}
        </p>

        <div class="option-list">
          <button
            class="option-row"
            v-for="opt in availableLocales"
            :key="opt.code"
            :class="{ active: locale === opt.code }"
            @click="onSelect(opt.code, opt.label)"
          >
            <div class="option-icon">
              <ion-icon :icon="languageOutline" />
            </div>
            <span>{{ opt.label }}</span>
            <ion-icon :icon="locale === opt.code ? checkmarkCircle : ellipseOutline" class="check" />
          </button>
        </div>
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
import { chevronBackOutline, languageOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { useLanguage } from '@/composables/useLanguage';
import type { SupportedLocale } from '@/i18n';

const router = useRouter();
const { t } = useI18n();
const { locale, setLocale, availableLocales } = useLanguage();

const showToast = ref(false);
const toastMessage = ref('');

function onSelect(code: SupportedLocale, label: string) {
  if (locale.value === code) return;
  setLocale(code);
  toastMessage.value = t('language.setTo', { name: label });
  showToast.value = true;
}
</script>

<style scoped>
.language-content {
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

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid transparent;
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.option-row.active {
  border-color: #ff6b35;
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.option-row span {
  flex: 1;
}

.check {
  font-size: 20px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
}

.option-row.active .check {
  color: #ff6b35;
}
</style>
