<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="stack-header">
        <button class="back-btn" aria-label="Go back" @click="router.push('/login')">
          <ion-icon :icon="chevronBackOutline" />
        </button>
      </div>

      <div class="auth-body">
        <div class="brand-mark">
          <img src="@/images/logo.png" :alt="$t('common.logoAlt')" />
        </div>
        <h1>{{ $t('auth.register.title') }}</h1>
        <p class="sub">{{ $t('auth.register.subtitle') }}</p>

        <div class="field-group">
          <div class="name-row">
            <label class="field" :class="{ invalid: touched && !isFirstNameValid }">
              <ion-icon :icon="personOutline" />
              <input v-model="firstName" :placeholder="$t('auth.register.firstNamePlaceholder')" autocomplete="given-name" @blur="touched = true" />
            </label>
            <label class="field" :class="{ invalid: touched && !isLastNameValid }">
              <input v-model="lastName" :placeholder="$t('auth.register.lastNamePlaceholder')" autocomplete="family-name" @blur="touched = true" />
            </label>
          </div>
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
          <label class="field select-field" :class="{ invalid: touched && !isUniversityValid }">
            <ion-icon :icon="schoolOutline" />
            <select v-model="universityId" @blur="touched = true">
              <option value="" disabled>{{ $t('auth.register.universityPlaceholder') }}</option>
              <option v-for="uni in universities" :key="uni.id" :value="String(uni.id)">{{ uni.name }}</option>
            </select>
          </label>
          <label class="field" :class="{ invalid: touched && !isPasswordValid }">
            <ion-icon :icon="lockClosedOutline" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.login.passwordPlaceholder')"
              autocomplete="new-password"
              @blur="touched = true"
            />
            <button class="visibility-btn" type="button" @click="showPassword = !showPassword">
              <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
            </button>
          </label>
          <label class="field" :class="{ invalid: touched && !isConfirmValid }">
            <ion-icon :icon="lockClosedOutline" />
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
              autocomplete="new-password"
              @blur="touched = true"
            />
          </label>
        </div>

        <div class="strength-row" v-if="password">
          <div class="strength-bar">
            <span :class="strength.level"></span>
          </div>
          <p :class="strength.level">{{ strength.label }}</p>
        </div>

        <button class="terms-check" @click="acceptedTerms = !acceptedTerms">
          <ion-icon :icon="acceptedTerms ? checkboxOutline : squareOutline" />
          <span>
            {{ $t('auth.register.agreeToThe') }}
            <a @click.stop="router.push('/terms')">{{ $t('auth.register.termsAndPrivacy') }}</a>
          </span>
        </button>

        <button class="primary-btn" :disabled="!canSubmit" @click="onRegister">
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>{{ $t('auth.register.createAccount') }}</span>
        </button>

        <p class="switch-line">
          {{ $t('auth.register.alreadyHaveAccount') }}
          <button class="switch-link" @click="router.push('/login')">{{ $t('auth.register.signIn') }}</button>
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
  chevronBackOutline,
  personOutline,
  mailOutline,
  schoolOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkboxOutline,
  squareOutline,
} from 'ionicons/icons';
import { useAuth, AuthError } from '@/composables/useAuth';
import { universities } from '@/data/universities';

const router = useRouter();
const auth = useAuth();
const { t } = useI18n();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const universityId = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const acceptedTerms = ref(false);
const touched = ref(false);
const loading = ref(false);

const isFirstNameValid = computed(() => firstName.value.trim().length > 1);
const isLastNameValid = computed(() => lastName.value.trim().length > 1);
const isEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(email.value.trim()));
const isUniversityValid = computed(() => universityId.value.length > 0);
const isPasswordValid = computed(() => password.value.length >= 8);
const isConfirmValid = computed(() => confirmPassword.value.length > 0 && confirmPassword.value === password.value);

const strength = computed(() => {
  const len = password.value.length;
  const varied = /[A-Z]/.test(password.value) && /[0-9]/.test(password.value);
  if (len === 0) return { level: 'weak', label: '' };
  if (len >= 12 && varied) return { level: 'strong', label: t('auth.register.strengthStrong') };
  if (len >= 8) return { level: 'medium', label: t('auth.register.strengthGood') };
  return { level: 'weak', label: t('auth.register.strengthWeak') };
});

const canSubmit = computed(
  () =>
    isFirstNameValid.value &&
    isLastNameValid.value &&
    isEmailValid.value &&
    isUniversityValid.value &&
    isPasswordValid.value &&
    isConfirmValid.value &&
    acceptedTerms.value &&
    !loading.value
);

const showToast = ref(false);
const toastMessage = ref('');

function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

async function onRegister() {
  touched.value = true;
  if (
    !isFirstNameValid.value ||
    !isLastNameValid.value ||
    !isEmailValid.value ||
    !isUniversityValid.value ||
    !isPasswordValid.value ||
    !isConfirmValid.value
  )
    return;
  if (!acceptedTerms.value) {
    notify(t('auth.register.mustAcceptTerms'));
    return;
  }
  loading.value = true;
  try {
    const result = await auth.register({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      universityId: Number(universityId.value),
      password: password.value,
      passwordConfirmation: confirmPassword.value,
    });
    if (result.signedIn) {
      router.replace('/account-details');
    } else {
      notify(t('auth.register.confirmEmailNotice'));
      router.replace('/login');
    }
  } catch (err) {
    loading.value = false;
    notify(err instanceof AuthError ? err.firstErrorMessage() : t('auth.login.genericError'));
  }
}
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

.field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.name-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.name-row .field {
  min-width: 0;
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

.select-field select {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 14px;
  font-family: inherit;
}

.select-field select:focus {
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

.strength-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: var(--ion-color-step-100, #eee);
  overflow: hidden;
}

.strength-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.strength-bar span.weak {
  width: 33%;
  background: #ff3b30;
}

.strength-bar span.medium {
  width: 66%;
  background: #ff9f1c;
}

.strength-bar span.strong {
  width: 100%;
  background: #22a559;
}

.strength-row p {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.strength-row p.weak {
  color: #ff3b30;
}

.strength-row p.medium {
  color: #ff9f1c;
}

.strength-row p.strong {
  color: #22a559;
}

.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  border: none;
  background: none;
  text-align: left;
  color: var(--ion-text-color);
}

.terms-check ion-icon {
  font-size: 18px;
  color: #ff6b35;
  flex-shrink: 0;
  margin-top: 1px;
}

.terms-check span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.terms-check a {
  color: #ff6b35;
  font-weight: 600;
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
</style>
