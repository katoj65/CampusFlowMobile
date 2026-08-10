<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="stack-header">
        <button class="back-btn" aria-label="Go back" @click="router.push('/login')">
          <ion-icon :icon="chevronBackOutline" />
        </button>
      </div>

      <div class="auth-body" v-if="!submitted">
        <div class="brand-mark">
          <img src="@/images/logo.png" :alt="$t('common.logoAlt')" />
        </div>
        <h1>{{ $t('auth.forgotPassword.title') }}</h1>
        <p class="sub">{{ $t('auth.forgotPassword.subtitle') }}</p>

        <div class="field-group">
          <label class="field" :class="{ invalid: touched && !isEmailValid }">
            <ion-icon :icon="mailOutline" />
            <input
              v-model="email"
              type="email"
              :placeholder="$t('auth.login.emailPlaceholder')"
              autocomplete="email"
              @blur="touched = true"
              @keyup.enter="onSubmit"
            />
          </label>
        </div>

        <button class="primary-btn" :disabled="!canSubmit" @click="onSubmit">
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>{{ $t('auth.forgotPassword.sendResetLink') }}</span>
        </button>

        <p class="switch-line">
          {{ $t('auth.forgotPassword.rememberedIt') }}
          <button class="switch-link" @click="router.push('/login')">{{ $t('auth.register.signIn') }}</button>
        </p>
      </div>

      <div class="auth-body confirm-body" v-else>
        <div class="success-mark">
          <ion-icon :icon="checkmarkCircleOutline" />
        </div>
        <h1>{{ $t('auth.forgotPassword.checkEmail') }}</h1>
        <p class="sub">
          <i18n-t keypath="auth.forgotPassword.sentTo" tag="span">
            <template #email><strong>{{ email }}</strong></template>
          </i18n-t>
          {{ $t('auth.forgotPassword.arrivalNote') }}
        </p>

        <button class="primary-btn" @click="router.push('/login')">{{ $t('auth.forgotPassword.backToSignIn') }}</button>

        <p class="switch-line">
          {{ $t('auth.forgotPassword.didntGetIt') }}
          <button class="switch-link" :disabled="resendCooldown > 0" @click="onResend">
            {{ resendCooldown > 0 ? t('auth.forgotPassword.resendIn', { seconds: resendCooldown }) : t('auth.forgotPassword.resendEmail') }}
          </button>
        </p>
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
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast, IonSpinner } from '@ionic/vue';
import {
  chevronBackOutline,
  mailOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

const router = useRouter();
const { t } = useI18n();

const email = ref('');
const touched = ref(false);
const loading = ref(false);
const submitted = ref(false);

const isEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(email.value.trim()));
const canSubmit = computed(() => isEmailValid.value && !loading.value);

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

function onSubmit() {
  touched.value = true;
  if (!canSubmit.value) return;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    submitted.value = true;
    startCooldown();
  }, 700);
}

const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown() {
  resendCooldown.value = 30;
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

function onResend() {
  if (resendCooldown.value > 0) return;
  notify(t('auth.forgotPassword.resentNotice'));
  startCooldown();
}

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>

<style scoped>
.auth-content {
  --background: var(--ion-background-color, #fff);
}

.stack-header {
  padding: calc(16px + env(safe-area-inset-top)) 16px 4px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-background-color, #fff);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--ion-color-step-50, #f4f5f8);
  color: var(--ion-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.auth-body {
  padding: 8px 24px 32px;
  display: flex;
  flex-direction: column;
}

.brand-mark {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.brand-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.success-mark {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(34, 165, 89, 0.12);
  color: #22a559;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  margin-bottom: 18px;
}

.auth-body h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.sub {
  margin: 6px 0 22px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.sub strong {
  color: var(--ion-text-color);
  font-weight: 700;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: var(--ion-color-step-50, #f7f7f9);
}

.field.invalid {
  border-color: #ff3b30;
}

.field ion-icon:first-child {
  font-size: 17px;
  color: var(--ion-color-medium);
  flex-shrink: 0;
}

.field input {
  flex: 1;
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 14px;
  font-family: inherit;
  min-width: 0;
}

.field input:focus {
  outline: none;
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  min-height: 48px;
}

.primary-btn:disabled {
  background: var(--ion-color-step-150, #e8e8e8);
  color: var(--ion-color-medium);
}

.primary-btn ion-spinner {
  width: 20px;
  height: 20px;
}

.confirm-body .primary-btn {
  margin-top: 4px;
}

.switch-line {
  margin: 20px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.switch-link {
  border: none;
  background: none;
  color: #ff6b35;
  font-weight: 700;
  font-size: 13px;
}

.switch-link:disabled {
  color: var(--ion-color-medium);
  font-weight: 600;
}
</style>
