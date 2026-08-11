// In-memory mock notifications — not yet backed by the `notifications`
// table/Realtime, unlike the rest of the app's composables.
import { computed, reactive } from 'vue';

export type NotificationType = 'order' | 'reward' | 'menu' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRoute?: string;
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60000);
}

let notificationCounter = 1;

const notifications = reactive<AppNotification[]>([
  {
    id: 'n1',
    type: 'order',
    title: 'Order #10482 is preparing',
    message: "We're getting your Grilled Chicken & Herb Rice Bowl ready.",
    timestamp: minutesAgo(6),
    read: false,
    actionRoute: '/tabs/tab3',
  },
  {
    id: 'n2',
    type: 'menu',
    title: 'Garden Fresh Salad is almost gone',
    message: 'Only 2 left today — grab it before it sells out.',
    timestamp: minutesAgo(40),
    read: false,
    actionRoute: '/item/9',
  },
  {
    id: 'n3',
    type: 'reward',
    title: "You've earned 10 points",
    message: 'Thanks for ordering! 120 points to go until Gold.',
    timestamp: minutesAgo(75),
    read: true,
    actionRoute: '/tabs/tab4',
  },
  {
    id: 'n4',
    type: 'reward',
    title: 'Free Coffee unlocked',
    message: 'You have enough points to redeem a free coffee.',
    timestamp: minutesAgo(60 * 26),
    read: true,
    actionRoute: '/tabs/tab4',
  },
  {
    id: 'n5',
    type: 'order',
    title: 'Order #10391 completed',
    message: 'Thanks for picking up on time — see you again soon!',
    timestamp: minutesAgo(60 * 27),
    read: true,
    actionRoute: '/tabs/tab3',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Dietary preference updated',
    message: 'Your recommendations are now tailored to Vegetarian meals.',
    timestamp: minutesAgo(60 * 30),
    read: true,
    actionRoute: '/tabs/tab5',
  },
]);

function addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
  notifications.unshift({
    ...notification,
    id: `n${Date.now()}-${notificationCounter++}`,
    timestamp: new Date(),
    read: false,
  });
}

function markAsRead(id: string) {
  const notification = notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
}

function markAllAsRead() {
  for (const notification of notifications) {
    notification.read = true;
  }
}

const unreadCount = computed(() => notifications.filter((n) => !n.read).length);

export function useNotifications() {
  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead };
}
