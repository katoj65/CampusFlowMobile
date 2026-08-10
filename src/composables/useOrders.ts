import { reactive, ref } from 'vue';
import type { CartLine } from './useCart';
import { useNotifications } from './useNotifications';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface ActiveOrder {
  id: string;
  placedAt: string;
  pickupSlot: string;
  location: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  code: string;
}

export interface PastOrder {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

const PICKUP_LOCATION = 'Mensa Ground Floor, Counter 2';

const activeOrder = ref<ActiveOrder | null>({
  id: '10482',
  placedAt: '12:12 PM',
  pickupSlot: '12:45 PM – 1:00 PM',
  location: PICKUP_LOCATION,
  status: 'preparing',
  items: [
    { name: 'Grilled Chicken & Herb Rice Bowl', qty: 1, price: 4.8 },
    { name: 'Iced Coffee', qty: 1, price: 2.1 },
  ],
  total: 6.9,
  code: '482-91',
});

const orderHistory = reactive<PastOrder[]>([
  {
    id: '10391',
    date: 'Yesterday, 1:05 PM',
    items: [
      { name: 'Buddha Bowl', qty: 1, price: 3.9 },
      { name: 'Mango Berry Smoothie', qty: 1, price: 2.8 },
    ],
    total: 6.7,
    status: 'completed',
  },
  {
    id: '10276',
    date: 'Mon, Aug 3 · 12:30 PM',
    items: [{ name: 'Classic Beef Burger', qty: 1, price: 5.1 }],
    total: 5.1,
    status: 'completed',
  },
  {
    id: '10142',
    date: 'Fri, Jul 31 · 11:50 AM',
    items: [{ name: 'Pasta Primavera', qty: 1, price: 4.2 }],
    total: 4.2,
    status: 'cancelled',
  },
]);

let orderCounter = 10483;

function generateCode(): string {
  const a = Math.floor(100 + Math.random() * 900);
  const b = Math.floor(10 + Math.random() * 90);
  return `${a}-${b}`;
}

function placeOrder(cartLines: CartLine[], pickupSlot: string): ActiveOrder {
  if (activeOrder.value) {
    orderHistory.unshift({
      id: activeOrder.value.id,
      date: 'Earlier today',
      items: activeOrder.value.items,
      total: activeOrder.value.total,
      status: 'completed',
    });
  }

  const items: OrderItem[] = cartLines.map((line) => ({
    name: line.summary ? `${line.name} (${line.summary})` : line.name,
    qty: line.qty,
    price: line.unitPrice,
  }));

  const order: ActiveOrder = {
    id: String(orderCounter++),
    placedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    pickupSlot,
    location: PICKUP_LOCATION,
    status: 'placed',
    items,
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    code: generateCode(),
  };

  activeOrder.value = order;

  useNotifications().addNotification({
    type: 'order',
    title: `Order #${order.id} placed`,
    message: `We'll have it ready for pickup at ${order.pickupSlot}.`,
    actionRoute: '/tabs/tab3',
  });

  return order;
}

function cancelActiveOrder() {
  if (!activeOrder.value) return;
  const cancelledId = activeOrder.value.id;
  orderHistory.unshift({
    id: cancelledId,
    date: 'Just now',
    items: activeOrder.value.items,
    total: activeOrder.value.total,
    status: 'cancelled',
  });
  activeOrder.value = null;

  useNotifications().addNotification({
    type: 'order',
    title: `Order #${cancelledId} cancelled`,
    message: 'Your pickup slot has been released.',
    actionRoute: '/tabs/tab3',
  });
}

export function useOrders() {
  return { activeOrder, orderHistory, placeOrder, cancelActiveOrder };
}
