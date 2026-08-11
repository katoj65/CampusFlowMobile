<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="auth-hero">
        <div class="brand-mark">
          <img src="@/images/logo.png" :alt="$t('common.logoAlt')" />
        </div>
        <h1>CampusFlow</h1>
        <p>{{ $t('auth.login.tagline') }}</p>
      </div>

      <div class="auth-sheet">
        <h2>{{ $t('auth.login.welcomeBack') }}</h2>
        <p class="sub">{{ $t('auth.login.subtitle') }}</p>

        <div class="field-group">
          <label class="field" :class="{ invalid: touched && !isEmailValid }">
            <ion-icon :icon="mailOutline" />
            <input
              v-model="email"
              type="email"
              :placeholder="$t('auth.login.emailPlaceholder')"
              autocomplete="email"
              @blur="touched = true"
            />
          </label>
          <label class="field" :class="{ invalid: touched && !isPasswordValid }">
            <ion-icon :icon="lockClosedOutline" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.login.passwordPlaceholder')"
              autocomplete="current-password"
              @blur="touched = true"
            />
            <button class="visibility-btn" type="button" @click="showPassword = !showPassword">
              <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
            </button>
          </label>
        </div>

        <button class="forgot-link" @click="router.push('/forgot-password')">{{ $t('auth.login.forgotPassword') }}</button>

        <button class="primary-btn" :disabled="!canSubmit" @click="onLogin">
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>{{ $t('auth.login.signIn') }}</span>
        </button>

        <div class="divider">
          <span></span>
          <p>{{ $t('auth.login.orContinueWith') }}</p>
          <span></span>
        </div>

        <div class="social-row">
          <button class="social-btn" @click="notify(t('auth.login.googleComingSoon'))">
            <ion-icon :icon="logoGoogle" />
            Google
          </button>
          <button class="social-btn" @click="notify(t('auth.login.appleComingSoon'))">
            <ion-icon :icon="logoApple" />
            Apple
          </button>
        </div>

        <p class="switch-line">
          {{ $t('auth.login.newToCampusFlow') }}
          <button class="switch-link" @click="router.push('/register')">{{ $t('auth.login.createAccount') }}</button>
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast, IonSpinner } from '@ionic/vue';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
  logoApple,
} from 'ionicons/icons';
import { useAuth, AuthError } from '@/composables/useAuth';

const router = useRouter();
const auth = useAuth();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const touched = ref(false);
const loading = ref(false);

const isEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(email.value.trim()));
const isPasswordValid = computed(() => password.value.length >= 6);
const canSubmit = computed(() => isEmailValid.value && isPasswordValid.value && !loading.value);

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onLogin() {
  touched.value = true;
  if (!canSubmit.value) return;
  loading.value = true;
  try {
    await auth.login({ email: email.value.trim(), password: password.value });
    router.replace('/tabs/tab1');
  } catch (err) {
    loading.value = false;
    notify(
      err instanceof AuthError && err.code === 'invalid_credentials'
        ? t('auth.login.incorrectCredentials')
        : err instanceof AuthError
          ? err.firstErrorMessage()
          : t('auth.login.genericError')
    );
  }
}
</script>

<style scoped>
.auth-content {
  --background: #fff;
}

.auth-hero {
  padding: calc(48px + env(safe-area-inset-top)) 24px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fdeee1;
  border-radius: 0 0 36px 36px;
  color: #2b2118;
}

.brand-mark {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: 0 8px 20px -10px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.brand-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.auth-hero h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.auth-hero p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(43, 33, 24, 0.65);
}

.auth-sheet {
  margin-top: -32px;
  padding: 28px 22px calc(28px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
}

.auth-sheet h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.sub {
  margin: 4px 0 20px;
  font-size: 13px;
  color: var(--ion-color-medium);
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

.visibility-btn {
  border: none;
  background: none;
  color: var(--ion-color-medium);
  font-size: 17px;
  flex-shrink: 0;
  display: flex;
}

.forgot-link {
  align-self: flex-end;
  margin-top: 10px;
  border: none;
  background: none;
  color: #ff6b35;
  font-size: 12px;
  font-weight: 600;
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 18px;
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

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.divider span {
  flex: 1;
  height: 1px;
  background: var(--ion-color-step-100, #eee);
}

.divider p {
  margin: 0;
  font-size: 11px;
  color: var(--ion-color-medium);
  white-space: nowrap;
}

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  border: 1.5px solid var(--ion-color-step-100, #eee);
  background: none;
  color: var(--ion-text-color);
  font-weight: 600;
  font-size: 13px;
}

.social-btn ion-icon {
  font-size: 16px;
}

.switch-line {
  margin: 22px 0 0;
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
</style>
