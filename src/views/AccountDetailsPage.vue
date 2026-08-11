<template>
  <ion-page>
    <ion-content :fullscreen="true" class="account-content">
      <div class="stack-header">
        <button class="back-btn" aria-label="Go back" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('account.details.title') }}</h1>
      </div>

      <div class="page-body">
        <div class="avatar-row">
          <ion-avatar class="avatar">
            <img :src="avatarUrl" :alt="t('account.details.avatarAlt', { name: form.name })" />
          </ion-avatar>
          <button class="avatar-edit-btn" @click="notify(t('account.details.photoComingSoon'))">
            <ion-icon :icon="cameraOutline" />
            {{ $t('account.details.changePhoto') }}
          </button>
        </div>

        <section class="detail-section">
          <h2>{{ $t('account.details.personalInfo') }}</h2>
          <div class="form-card">
            <label class="field">
              <span>{{ $t('account.details.fullName') }}</span>
              <input v-model="form.name" class="field-input" :placeholder="$t('account.details.namePlaceholder')" />
            </label>
            <label class="field">
              <span>{{ $t('account.details.email') }}</span>
              <input v-model="form.email" class="field-input" type="email" placeholder="you@university.edu" />
            </label>
            <label class="field">
              <span>{{ $t('account.details.phone') }}</span>
              <input v-model="form.phone" class="field-input" type="tel" placeholder="+352 621 234 567" />
            </label>
          </div>
        </section>

        <section class="detail-section">
          <h2>{{ $t('account.details.studentInfo') }}</h2>
          <div class="form-card">
            <label class="field">
              <span>{{ $t('account.details.studentId') }}</span>
              <input
                v-model="form.studentId"
                class="field-input"
                :placeholder="$t('account.details.studentIdPlaceholder')"
              />
            </label>
            <label class="field">
              <span>{{ $t('account.details.university') }}</span>
              <select v-model="form.universityId" class="field-input">
                <option value="">{{ $t('account.details.universityPlaceholder') }}</option>
                <option v-for="uni in universities" :key="uni.id" :value="String(uni.id)">{{ uni.name }}</option>
              </select>
            </label>
            <div class="readonly-row">
              <div class="readonly-icon">
                <ion-icon :icon="calendarOutline" />
              </div>
              <div class="readonly-text">
                <strong>{{ $t('account.details.memberSince') }}</strong>
                <span>{{ account.memberSince }}</span>
              </div>
              <ion-icon :icon="lockClosedOutline" class="lock" />
            </div>
          </div>
          <p class="section-hint">
            <ion-icon :icon="informationCircleOutline" />
            {{ $t('account.details.studentIdHint') }}
          </p>
        </section>

        <section class="detail-section">
          <h2>{{ $t('account.details.language') }}</h2>
          <div class="form-card">
            <div class="language-row">
              <button
                v-for="opt in availableLocales"
                :key="opt.code"
                type="button"
                class="lang-option"
                :class="{ active: locale === opt.code }"
                @click="setLocale(opt.code)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div class="save-footer" slot="fixed">
        <button class="save-btn" :disabled="!isDirty || !canSave" @click="onSave">
          {{ isDirty ? $t('account.details.saveChanges') : $t('account.details.saved') }}
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
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonAvatar, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  cameraOutline,
  calendarOutline,
  lockClosedOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useAccount } from '@/composables/useAccount';
import { useLanguage } from '@/composables/useLanguage';
import { universities } from '@/data/universities';

const router = useRouter();
const { account, updateAccount } = useAccount();
const { t } = useI18n();
const { locale, setLocale, availableLocales } = useLanguage();

const form = reactive({
  name: account.name,
  email: account.email,
  phone: account.phone,
  studentId: account.studentId,
  universityId: account.universityId !== null ? String(account.universityId) : '',
});

watch(
  () => [account.name, account.email, account.phone, account.studentId, account.universityId] as const,
  ([name, email, phone, studentId, universityId]) => {
    form.name = name;
    form.email = email;
    form.phone = phone;
    form.studentId = studentId;
    form.universityId = universityId !== null ? String(universityId) : '';
  }
);

const isDirty = computed(
  () =>
    form.name !== account.name ||
    form.email !== account.email ||
    form.phone !== account.phone ||
    form.studentId !== account.studentId ||
    form.universityId !== (account.universityId !== null ? String(account.universityId) : '')
);

const canSave = computed(() => form.name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(form.email.trim()));

const avatarUrl = computed(
  () => `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'S')}&background=FF6B35&color=fff&bold=true&size=160`
);

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onSave() {
  if (!canSave.value) return;
  try {
    await updateAccount({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      studentId: form.studentId.trim(),
      universityId: form.universityId ? Number(form.universityId) : null,
    });
    notify(t('account.details.updated'));
  } catch {
    notify(t('account.details.updateFailed'));
  }
}
</script>

<style scoped>
.account-content {
  --background: var(--ion-color-step-50, #f4f5f8);
  --padding-bottom: 100px;
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
  padding: 4px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 0 4px;
}

.avatar {
  width: 84px;
  height: 84px;
  border: 3px solid var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.4);
}

.avatar-edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  color: #ff6b35;
  font-weight: 700;
  font-size: 13px;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.section-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.section-hint ion-icon {
  font-size: 14px;
  margin-top: 1px;
  flex-shrink: 0;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 18px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.field:last-child {
  border-bottom: none;
}

.field span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ion-color-medium);
}

.field-input {
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 15px;
  font-family: inherit;
  padding: 0;
}

.field-input:focus {
  outline: none;
}

.language-row {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.lang-option {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: none;
  color: var(--ion-text-color);
  font-weight: 600;
  font-size: 13px;
}

.lang-option.active {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.readonly-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.readonly-row:last-child {
  border-bottom: none;
}

.readonly-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.readonly-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.readonly-text span {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.lock {
  font-size: 14px;
  color: var(--ion-color-step-300, #ccc);
  flex-shrink: 0;
}

.save-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
}

.save-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
}

.save-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}
</style>
