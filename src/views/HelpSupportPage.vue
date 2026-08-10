<template>
  <ion-page>
    <ion-content :fullscreen="true" class="help-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('help.title') }}</h1>
      </div>

      <div class="page-body">
        <div class="search-bar">
          <ion-icon :icon="searchOutline" />
          <input v-model="query" :placeholder="$t('help.searchPlaceholder')" />
        </div>

        <section class="detail-section">
          <h2>{{ $t('help.contactUs') }}</h2>
          <div class="contact-grid">
            <button class="contact-tile" @click="notify(t('help.openingLiveChat'))">
              <div class="contact-icon chat">
                <ion-icon :icon="chatbubbleEllipsesOutline" />
              </div>
              <strong>{{ $t('help.liveChat') }}</strong>
              <span>{{ $t('help.avgReply') }}</span>
            </button>
            <button class="contact-tile" @click="notify(t('help.openingMailApp'))">
              <div class="contact-icon mail">
                <ion-icon :icon="mailOutline" />
              </div>
              <strong>{{ $t('help.email') }}</strong>
              <span>support@campusflow.app</span>
            </button>
            <button class="contact-tile" @click="notify(t('help.callingSupportLine'))">
              <div class="contact-icon call">
                <ion-icon :icon="callOutline" />
              </div>
              <strong>{{ $t('help.callUs') }}</strong>
              <span>{{ $t('help.callHours') }}</span>
            </button>
            <button class="contact-tile" @click="notify(t('help.openingFeedbackForm'))">
              <div class="contact-icon feedback">
                <ion-icon :icon="chatboxOutline" />
              </div>
              <strong>{{ $t('help.feedback') }}</strong>
              <span>{{ $t('help.feedbackHint') }}</span>
            </button>
          </div>
        </section>

        <section class="detail-section">
          <h2>{{ $t('help.faqTitle') }}</h2>
          <div class="faq-list">
            <div class="faq-item" v-for="(faq, index) in filteredFaqs" :key="faq.question">
              <button class="faq-question" @click="toggleFaq(index)">
                <span>{{ faq.question }}</span>
                <ion-icon :icon="chevronDownOutline" :class="{ open: openIndex === index }" />
              </button>
              <div class="faq-answer" v-if="openIndex === index">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
            <p v-if="filteredFaqs.length === 0" class="empty-hint">{{ t('help.noResultsFor', { query }) }}</p>
          </div>
        </section>

        <button class="terms-link" @click="router.push('/terms')">
          <ion-icon :icon="documentTextOutline" />
          {{ $t('help.viewTermsPrivacy') }}
          <ion-icon :icon="chevronForwardOutline" class="chevron" />
        </button>
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
  searchOutline,
  chatbubbleEllipsesOutline,
  mailOutline,
  callOutline,
  chatboxOutline,
  chevronDownOutline,
  documentTextOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

const router = useRouter();
const { t } = useI18n();

const query = ref('');
const openIndex = ref<number | null>(0);

const faqs = computed(() => [
  { question: t('help.faq1Q'), answer: t('help.faq1A') },
  { question: t('help.faq2Q'), answer: t('help.faq2A') },
  { question: t('help.faq3Q'), answer: t('help.faq3A') },
  { question: t('help.faq4Q'), answer: t('help.faq4A') },
  { question: t('help.faq5Q'), answer: t('help.faq5A') },
  { question: t('help.faq6Q'), answer: t('help.faq6A') },
]);

const filteredFaqs = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return faqs.value;
  return faqs.value.filter(
    (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
  );
});

function toggleFaq(index: number) {
  openIndex.value = openIndex.value === index ? null : index;
}

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}
</script>

<style scoped>
.help-content {
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

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  color: var(--ion-color-medium);
}

.search-bar input {
  flex: 1;
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 14px;
  font-family: inherit;
}

.search-bar input:focus {
  outline: none;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.contact-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  border-radius: 18px;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  text-align: left;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.contact-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  margin-bottom: 4px;
}

.contact-icon.chat {
  background: rgba(46, 196, 182, 0.14);
  color: #2ec4b6;
}

.contact-icon.mail {
  background: rgba(91, 141, 239, 0.14);
  color: #5b8def;
}

.contact-icon.call {
  background: rgba(255, 107, 53, 0.14);
  color: #ff6b35;
}

.contact-icon.feedback {
  background: rgba(138, 92, 246, 0.14);
  color: #8a5cf6;
}

.contact-tile strong {
  font-size: 13px;
  font-weight: 700;
}

.contact-tile span {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 14px;
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
}

.faq-question ion-icon {
  font-size: 16px;
  color: var(--ion-color-medium);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.faq-question ion-icon.open {
  transform: rotate(180deg);
  color: #ff6b35;
}

.faq-answer {
  padding: 0 14px 14px;
}

.faq-answer p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ion-color-medium);
}

.empty-hint {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.terms-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 16px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.terms-link ion-icon:first-child {
  font-size: 17px;
  color: #ff6b35;
}

.terms-link .chevron {
  margin-left: auto;
  font-size: 15px;
  color: var(--ion-color-medium);
}
</style>
