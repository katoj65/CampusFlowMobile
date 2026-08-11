<template>
  <ion-page>
    <ion-content :fullscreen="true" class="profile-content">
      <div class="profile-header">
        <ion-avatar class="profile-avatar">
          <img :src="avatarUrl" :alt="t('dashboard.profilePhotoAlt', { name: account.name })" />
        </ion-avatar>
        <h1>{{ account.name }}</h1>
        <p class="profile-email">{{ account.email }}</p>
        <button class="edit-btn" @click="router.push('/account-details')">
          <ion-icon :icon="createOutline" />
          {{ $t('profile.editProfile') }}
        </button>
      </div>

      <div class="page-body">
        <div class="stats-row">
          <div class="panel-card stat-tile">
            <strong>{{ student.orders }}</strong>
            <span>{{ $t('nav.orders') }}</span>
          </div>
          <div class="panel-card stat-tile">
            <strong>{{ student.points }}</strong>
            <span>{{ $t('rewards.points') }}</span>
          </div>
          <div class="panel-card stat-tile">
            <strong>{{ account.memberSince }}</strong>
            <span>{{ $t('account.details.memberSince') }}</span>
          </div>
        </div>

        <button class="panel-card diet-card" @click="router.push('/dietary-preference')">
          <div class="diet-icon">
            <ion-icon :icon="leafOutline" />
          </div>
          <div class="diet-text">
            <strong>{{ $t('profile.dietaryPreference') }}</strong>
            <span>{{ dietSummary }}</span>
          </div>
          <ion-icon :icon="chevronForwardOutline" class="chevron" />
        </button>

        <section class="settings-section">
          <p class="settings-label">{{ $t('profile.account') }}</p>
          <div class="panel-card settings-card">
            <button
              class="settings-row"
              v-for="item in accountItems"
              :key="item.key"
              @click="item.route ? router.push(item.route) : onComingSoon(item.label)"
            >
              <div class="settings-icon">
                <ion-icon :icon="item.icon" />
              </div>
              <span>{{ item.label }}</span>
              <ion-icon :icon="chevronForwardOutline" class="chevron" />
            </button>
          </div>
        </section>

        <section class="settings-section">
          <p class="settings-label">{{ $t('profile.support') }}</p>
          <div class="panel-card settings-card">
            <button
              class="settings-row"
              v-for="item in supportItems"
              :key="item.key"
              @click="item.route ? router.push(item.route) : onComingSoon(item.label)"
            >
              <div class="settings-icon">
                <ion-icon :icon="item.icon" />
              </div>
              <span>{{ item.label }}</span>
              <ion-icon :icon="chevronForwardOutline" class="chevron" />
            </button>
          </div>
        </section>

        <button class="logout-btn" @click="showLogoutAlert = true">
          <ion-icon :icon="logOutOutline" />
          {{ $t('profile.logOut') }}
        </button>

        <p class="app-version">CampusFlow v0.0.1</p>
      </div>

      <ConfirmDialog
        :is-open="showLogoutAlert"
        :icon="logOutOutline"
        :title="t('profile.logoutConfirmHeader')"
        :message="t('profile.logoutConfirmMessage')"
        :confirm-text="t('profile.logOut')"
        :cancel-text="t('profile.cancel')"
        destructive
        @cancel="showLogoutAlert = false"
        @confirm="onConfirmLogout"
      />

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
import { IonPage, IonContent, IonIcon, IonAvatar, IonToast } from '@ionic/vue';
import {
  createOutline,
  leafOutline,
  chevronForwardOutline,
  personCircleOutline,
  walletOutline,
  cardOutline,
  notificationsOutline,
  locationOutline,
  languageOutline,
  helpCircleOutline,
  documentTextOutline,
  logOutOutline,
  calendarOutline,
  receiptOutline,
} from 'ionicons/icons';
import { useProfile } from '@/composables/useProfile';
import { useAccount } from '@/composables/useAccount';
import { useAuth } from '@/composables/useAuth';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const { t } = useI18n();
const { primaryDiet, allergies } = useProfile();
const { account } = useAccount();
const auth = useAuth();

const dietSummary = computed(() =>
  allergies.value.length
    ? t('profile.dietSummaryWithAllergies', { diet: primaryDiet.value, count: allergies.value.length }, allergies.value.length)
    : primaryDiet.value
);

interface SettingsItem {
  key: string;
  label: string;
  icon: string;
  route?: string;
}

const student = ref({
  orders: 24,
  points: 480,
});

const avatarUrl = computed(
  () => `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=FF6B35&color=fff&bold=true&size=160`
);

const accountItems = computed<SettingsItem[]>(() => [
  { key: 'accountDetails', label: t('profile.accountDetails'), icon: personCircleOutline, route: '/account-details' },
  { key: 'weeklyMealPlan', label: t('weeklyPlan.title'), icon: calendarOutline, route: '/weekly-meal-plan' },
  { key: 'wallet', label: t('wallet.title'), icon: walletOutline, route: '/wallet' },
  { key: 'transactions', label: t('wallet.transactions'), icon: receiptOutline, route: '/transactions' },
  { key: 'paymentMethods', label: t('profile.paymentMethods'), icon: cardOutline, route: '/payment-methods' },
  { key: 'notifications', label: t('profile.notifications'), icon: notificationsOutline, route: '/notifications' },
  { key: 'pickupLocation', label: t('profile.savedPickupLocation'), icon: locationOutline, route: '/pickup-location' },
  { key: 'language', label: t('profile.language'), icon: languageOutline, route: '/language' },
]);

const supportItems = computed<SettingsItem[]>(() => [
  { key: 'helpSupport', label: t('profile.helpSupport'), icon: helpCircleOutline, route: '/help-support' },
  { key: 'terms', label: t('profile.termsPrivacy'), icon: documentTextOutline, route: '/terms' },
]);

const showToast = ref(false);
const toastMessage = ref('');

function onComingSoon(label: string) {
  toastMessage.value = t('profile.comingSoon', { label });
  showToast.value = true;
}

const showLogoutAlert = ref(false);

async function onConfirmLogout() {
  showLogoutAlert.value = false;
  await auth.logout();
  router.replace('/login');
}
</script>

<style scoped>
.profile-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.profile-header {
  padding: calc(28px + env(safe-area-inset-top)) 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fdeee1;
  border-radius: 0 0 28px 28px;
  color: #2b2118;
}

.profile-avatar {
  width: 84px;
  height: 84px;
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.profile-header h1 {
  margin: 12px 0 2px;
  font-size: 20px;
  font-weight: 700;
}

.profile-email {
  margin: 0;
  font-size: 13px;
  color: rgba(43, 33, 24, 0.65);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #ff6b35;
  font-weight: 600;
  font-size: 12px;
}

.page-body {
  padding: 18px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-card {
  background: var(--ion-card-background, #fff);
  border-radius: 20px;
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.35);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 6px;
}

.stat-tile strong {
  font-size: 16px;
  font-weight: 800;
}

.stat-tile span {
  margin-top: 2px;
  font-size: 11px;
  color: var(--ion-color-medium);
  text-align: center;
}

.diet-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: none;
  width: 100%;
  text-align: left;
  color: var(--ion-text-color);
}

.diet-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(46, 196, 182, 0.14);
  color: #2ec4b6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.diet-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.diet-text span {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 2px;
}

.chevron {
  font-size: 16px;
  color: var(--ion-color-medium);
  flex-shrink: 0;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-label {
  margin: 0 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ion-color-medium);
}

.settings-card {
  padding: 4px 6px;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 10px;
  border: none;
  background: none;
  color: var(--ion-text-color);
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid var(--ion-color-step-100, #eee);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.settings-row span {
  flex: 1;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 59, 48, 0.35);
  background: rgba(255, 59, 48, 0.08);
  color: #ff3b30;
  font-weight: 700;
  font-size: 14px;
}

.app-version {
  margin: 4px 0 0;
  text-align: center;
  font-size: 11px;
  color: var(--ion-color-medium);
}
</style>
