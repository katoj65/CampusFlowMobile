<template>
  <ion-page>
    <ion-content :fullscreen="true" class="terms-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('terms.title') }}</h1>
      </div>

      <div class="page-body">
        <p class="updated">{{ $t('terms.lastUpdated') }}</p>

        <div class="segment-sticky">
          <ion-segment v-model="activeSegment" class="terms-segment" mode="ios">
            <ion-segment-button value="terms"><ion-label>{{ $t('terms.tabTerms') }}</ion-label></ion-segment-button>
            <ion-segment-button value="privacy"><ion-label>{{ $t('terms.tabPrivacy') }}</ion-label></ion-segment-button>
          </ion-segment>
        </div>

        <div v-if="activeSegment === 'terms'" class="doc-body">
          <section class="doc-section" v-for="section in termsSections" :key="section.title">
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </section>
        </div>

        <div v-else class="doc-body">
          <section class="doc-section" v-for="section in privacySections" :key="section.title">
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </section>
        </div>

        <p class="footer-note">
          {{ $t('terms.questionsNote') }}
          <span class="link">privacy@campusflow.app</span>
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';

const router = useRouter();
const { t } = useI18n();
const activeSegment = ref<'terms' | 'privacy'>('terms');

const termsSections = computed(() => [
  { title: t('terms.t1Title'), body: t('terms.t1Body') },
  { title: t('terms.t2Title'), body: t('terms.t2Body') },
  { title: t('terms.t3Title'), body: t('terms.t3Body') },
  { title: t('terms.t4Title'), body: t('terms.t4Body') },
  { title: t('terms.t5Title'), body: t('terms.t5Body') },
  { title: t('terms.t6Title'), body: t('terms.t6Body') },
]);

const privacySections = computed(() => [
  { title: t('terms.p1Title'), body: t('terms.p1Body') },
  { title: t('terms.p2Title'), body: t('terms.p2Body') },
  { title: t('terms.p3Title'), body: t('terms.p3Body') },
  { title: t('terms.p4Title'), body: t('terms.p4Body') },
  { title: t('terms.p5Title'), body: t('terms.p5Body') },
]);
</script>

<style scoped>
.terms-content {
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
  padding: 0 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.updated {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.segment-sticky {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--ion-color-step-50, #f4f5f8);
  padding-bottom: 16px;
}

.terms-segment {
  --background: var(--ion-color-step-100, #e9eaee);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.terms-segment ion-segment-button {
  --color: var(--ion-color-medium);
  --color-checked: #fff;
  --indicator-color: #ff6b35;
  --indicator-box-shadow: 0 4px 10px -2px rgba(255, 107, 53, 0.55);
  --border-radius: 9px;
  min-height: 40px;
  font-weight: 600;
  text-transform: none;
  font-size: 13px;
}

.doc-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.doc-section h2 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
}

.doc-section p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ion-color-medium);
}

.footer-note {
  margin: 22px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.link {
  color: #ff6b35;
  font-weight: 600;
}
</style>
