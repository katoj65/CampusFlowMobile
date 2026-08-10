<template>
  <ion-page>
    <ion-content :fullscreen="true" class="notif-content">
      <div class="stack-header">
        <button class="back-btn" :aria-label="$t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <h1>{{ $t('profile.notifications') }}</h1>
        <button v-if="unreadCount > 0" class="mark-read-btn" @click="markAllAsRead">{{ $t('notifications.markAllRead') }}</button>
      </div>

      <div class="page-body" v-if="notifications.length">
        <section class="notif-group" v-for="group in groupedNotifications" :key="group.label">
          <p class="group-label">{{ group.label }}</p>
          <div class="notif-list">
            <button
              class="notif-row"
              v-for="n in group.items"
              :key="n.id"
              :class="{ unread: !n.read }"
              @click="onOpen(n)"
            >
              <div class="notif-icon-wrap">
                <div class="notif-icon" :style="{ background: typeMeta(n.type).color + '1f', color: typeMeta(n.type).color }">
                  <ion-icon :icon="typeMeta(n.type).icon" />
                </div>
                <span v-if="!n.read" class="unread-dot" aria-hidden="true"></span>
              </div>
              <div class="notif-text">
                <div class="notif-title-row">
                  <h4>{{ n.title }}</h4>
                  <span class="notif-time">{{ formatRelativeTime(n.timestamp) }}</span>
                </div>
                <p>{{ n.message }}</p>
              </div>
            </button>
          </div>
        </section>
      </div>

      <div class="empty-state" v-else>
        <ion-icon :icon="notificationsOffOutline" />
        <h3>{{ $t('notifications.allCaughtUp') }}</h3>
        <p>{{ $t('notifications.emptyHint') }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { useLanguage } from '@/composables/useLanguage';
import {
  chevronBackOutline,
  receiptOutline,
  trophyOutline,
  restaurantOutline,
  informationCircleOutline,
  notificationsOffOutline,
} from 'ionicons/icons';
import { useNotifications, type AppNotification, type NotificationType } from '@/composables/useNotifications';

const router = useRouter();
const { t } = useI18n();
const { locale } = useLanguage();
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

const typeMap: Record<NotificationType, { icon: string; color: string }> = {
  order: { icon: receiptOutline, color: '#FF6B35' },
  reward: { icon: trophyOutline, color: '#8A5CF6' },
  menu: { icon: restaurantOutline, color: '#2EC4B6' },
  system: { icon: informationCircleOutline, color: '#5B8DEF' },
};

function typeMeta(type: NotificationType) {
  return typeMap[type];
}

function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString();
}

const groupedNotifications = computed(() => {
  const today: AppNotification[] = [];
  const earlier: AppNotification[] = [];
  for (const n of notifications) {
    (isToday(n.timestamp) ? today : earlier).push(n);
  }
  const groups: { label: string; items: AppNotification[] }[] = [];
  if (today.length) groups.push({ label: t('notifications.today'), items: today });
  if (earlier.length) groups.push({ label: t('notifications.earlier'), items: earlier });
  return groups;
});

function formatRelativeTime(date: Date): string {
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return t('notifications.justNow');
  if (diffMin < 60) return t('notifications.minutesAgo', { n: diffMin });
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return t('notifications.hoursAgo', { n: diffHr });
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return t('notifications.yesterday');
  if (diffDay < 7) return t('notifications.daysAgo', { n: diffDay });
  return date.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' });
}

function onOpen(n: AppNotification) {
  markAsRead(n.id);
  if (n.actionRoute) router.push(n.actionRoute);
}
</script>

<style scoped>
.notif-content {
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
  flex: 1;
}

.mark-read-btn {
  border: none;
  background: none;
  color: #ff6b35;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
  white-space: nowrap;
}

.page-body {
  padding: 4px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notif-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  margin: 0 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ion-color-medium);
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 18px;
  text-align: left;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 20px -18px rgba(0, 0, 0, 0.4);
}

.notif-row.unread {
  background: linear-gradient(0deg, var(--ion-card-background, #fff), var(--ion-card-background, #fff)),
    linear-gradient(0deg, rgba(255, 107, 53, 0.06), rgba(255, 107, 53, 0.06));
}

.notif-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.notif-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.notif-text {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.notif-title-row h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ion-text-color);
}

.notif-row:not(.unread) .notif-title-row h4 {
  font-weight: 600;
  color: var(--ion-color-medium);
}

.notif-time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.notif-text p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ion-color-medium);
}

.unread-dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff3b30;
  border: 2px solid var(--ion-card-background, #fff);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
