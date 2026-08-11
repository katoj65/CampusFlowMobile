// Active order + order history, kept live via a Realtime subscription on
// `orders`. Checkout itself is the place_order() Postgres function — see
// its doc comment on placeOrder() below.
import { reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';
import { pickupLocations, usePickupLocation } from './usePickupLocation';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  extrasTotal: number;
}

export interface ActiveOrder {
  id: number;
  placedAt: string;
  placedAtIso: string;
  pickupSlot: string;
  location: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  code: string;
}

export interface PastOrder {
  id: number;
  date: string;
  placedAt: string;
  pickupSlot: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: OrderStatus;
}

const activeOrder = ref<ActiveOrder | null>(null);
const orderHistory = reactive<PastOrder[]>([]);
const loaded = ref(false);
const cancellationWindowMinutes = ref(30);
let cancellationPolicyLoaded = false;

async function fetchCancellationPolicy() {
  if (cancellationPolicyLoaded) return;
  cancellationPolicyLoaded = true;
  const { data } = await supabase
    .from('order_cancellation')
    .select('minutes')
    .eq('status', 'active')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) cancellationWindowMinutes.value = data.minutes;
}

/** Mirrors the server-side RLS rule (orders can only be cancelled while
 * placed/preparing and within the active cancellation window) so the Cancel
 * button doesn't linger past the point where cancelling would actually work. */
function canCancelOrder(order: Pick<ActiveOrder, 'status' | 'placedAtIso'>): boolean {
  if (order.status !== 'placed' && order.status !== 'preparing') return false;
  const elapsedMinutes = (Date.now() - new Date(order.placedAtIso).getTime()) / 60000;
  return elapsedMinutes < cancellationWindowMinutes.value;
}

let channel: ReturnType<typeof supabase.channel> | null = null;

function locationLabel(id: number | null): string {
  return pickupLocations.find((l) => l.id === id)?.name ?? '';
}

function formatPlacedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function loadItemsFor(orderId: number): Promise<OrderItem[]> {
  const { data } = await supabase
    .from('order_items')
    .select('name, qty, unit_price, extras_total_price')
    .eq('order_id', orderId);
  return (data ?? []).map((row) => ({
    name: row.name,
    qty: row.qty,
    unitPrice: row.unit_price,
    extrasTotal: row.extras_total_price,
  }));
}

async function fetchOrders() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: rows } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('placed_at', { ascending: false });
  if (!rows) return;

  const active = rows.find((r) => r.status === 'placed' || r.status === 'preparing' || r.status === 'ready');
  if (active) {
    activeOrder.value = {
      id: active.id,
      placedAt: formatPlacedAt(active.placed_at),
      placedAtIso: active.placed_at,
      pickupSlot: active.pickup_slot,
      location: locationLabel(active.pickup_location_id),
      status: active.status,
      items: await loadItemsFor(active.id),
      total: active.total,
      paymentMethod: active.payment_method,
      code: active.code,
    };
  } else {
    activeOrder.value = null;
  }

  const historyEntries: PastOrder[] = [];
  for (const row of rows) {
    historyEntries.push({
      id: row.id,
      date: formatOrderDate(row.placed_at),
      placedAt: row.placed_at,
      pickupSlot: row.pickup_slot,
      items: await loadItemsFor(row.id),
      total: row.total,
      paymentMethod: row.payment_method,
      status: row.status,
    });
  }
  orderHistory.splice(0, orderHistory.length, ...historyEntries);
  loaded.value = true;
}

function subscribeToOrders(userId: string) {
  if (channel) return;
  channel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      () => fetchOrders()
    )
    .subscribe();
}

/** Checkout runs entirely inside the place_order() Postgres function —
 * total, order, and order_items all come from the user's cart_items rows
 * server-side in one transaction (and cart_items gets cleared there too),
 * rather than the client computing the total and making two separate
 * inserts that could leave a dangling empty order if the second failed. */
async function placeOrder(pickupSlot: string, paymentMethod: string): Promise<ActiveOrder> {
  const { selectedLocationId } = usePickupLocation();
  if (!selectedLocationId.value) throw new Error('No pickup location selected');

  const { data: order, error } = await supabase.rpc('place_order', {
    p_pickup_location_id: selectedLocationId.value,
    p_pickup_slot: pickupSlot,
    p_payment_method: paymentMethod,
  });
  if (error || !order) throw new Error(error?.message ?? 'Could not place order');

  const newActive: ActiveOrder = {
    id: order.id,
    placedAt: formatPlacedAt(order.placed_at),
    placedAtIso: order.placed_at,
    pickupSlot: order.pickup_slot,
    location: locationLabel(order.pickup_location_id),
    status: order.status,
    items: await loadItemsFor(order.id),
    total: order.total,
    paymentMethod: order.payment_method,
    code: order.code,
  };
  activeOrder.value = newActive;
  return newActive;
}

/** Loads a single order by id for the order tracking page — independent of
 * activeOrder/orderHistory since a tracked order may be in any status. */
async function fetchOrderById(id: number): Promise<ActiveOrder | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: row } = await supabase.from('orders').select('*').eq('id', id).eq('user_id', userData.user.id).single();
  if (!row) return null;

  return {
    id: row.id,
    placedAt: formatPlacedAt(row.placed_at),
    placedAtIso: row.placed_at,
    pickupSlot: row.pickup_slot,
    location: locationLabel(row.pickup_location_id),
    status: row.status,
    items: await loadItemsFor(row.id),
    total: row.total,
    paymentMethod: row.payment_method,
    code: row.code,
  };
}

async function cancelOrder(id: number) {
  const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw new Error(error.message);
  await fetchOrders();
}

async function cancelActiveOrder() {
  if (!activeOrder.value) return;
  await cancelOrder(activeOrder.value.id);
}

export function useOrders() {
  if (!loaded.value) {
    fetchOrders().then(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) subscribeToOrders(userData.user.id);
    });
  }
  fetchCancellationPolicy();
  return {
    activeOrder,
    orderHistory,
    loaded,
    cancellationWindowMinutes,
    canCancelOrder,
    placeOrder,
    cancelActiveOrder,
    cancelOrder,
    fetchOrderById,
    fetchOrders,
  };
}
