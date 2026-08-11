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

/** Loads the active cancellation window (minutes) once per session — the
 * same value canCancelOrder() below uses and the RLS policy on `orders`
 * enforces server-side, so this is only the client-side mirror of it. */
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

/** pickupLocations is still a hardcoded list (see usePickupLocation), so
 * this is a plain local lookup rather than a query. */
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

/** Fetches one order's line items — shared by fetchOrders(), placeOrder(),
 * and fetchOrderById() rather than duplicated in each. */
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

/** Refetches every order for the signed-in user and repopulates both
 * activeOrder (the single non-terminal one, if any) and orderHistory (all
 * of them, newest first) — this is what the Realtime subscription below
 * calls on every insert/update to `orders`. */
async function fetchOrders() {
  // Step 1: no session, nothing to fetch.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Step 2: newest first — orderHistory reads top-to-bottom as "most
  // recent order first" and this same array supplies activeOrder too.
  const { data: rows } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('placed_at', { ascending: false });
  if (!rows) return;

  // Step 3: at most one order should ever be in a non-terminal status —
  // that's the one shown as "your active order" on the dashboard/orders tab.
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

  // Step 4: every order (including the active one, if any) goes into
  // history too — Tab3's "past orders" list shows the full record.
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

/** Subscribes once per session — this is how a status change made in the
 * Supabase dashboard (there's no staff/kitchen app yet) reaches the client
 * live instead of requiring a manual refresh. */
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
 * inserts that could leave a dangling empty order if the second failed.
 * See supabase/migrations/0031_place_order_comments.sql for that function's
 * own step-by-step comments (total = qty*unit_price + extras_total_price
 * per cart line, computed server-side from the real cart_items rows). */
async function placeOrder(pickupSlot: string, paymentMethod: string): Promise<ActiveOrder> {
  // Step 1: a pickup location must be selected before we can check out —
  // the RPC has no fallback for it.
  const { selectedLocationId } = usePickupLocation();
  if (!selectedLocationId.value) throw new Error('No pickup location selected');

  // Step 2: hand off to place_order() — this single call does everything
  // (compute total, insert orders + order_items, clear cart_items) and
  // returns the new orders row.
  const { data: order, error } = await supabase.rpc('place_order', {
    p_pickup_location_id: selectedLocationId.value,
    p_pickup_slot: pickupSlot,
    p_payment_method: paymentMethod,
  });
  if (error || !order) throw new Error(error?.message ?? 'Could not place order');

  // Step 3: the RPC only returns the orders row, not its items — fetch
  // those separately so the confirmation screen has something to show.
  const items = await loadItemsFor(order.id);

  // Step 4: update local state immediately (rather than waiting on the
  // orders-changes Realtime subscription to refetch) so the confirmation
  // screen has data to render the moment this function resolves.
  const newActive: ActiveOrder = {
    id: order.id,
    placedAt: formatPlacedAt(order.placed_at),
    placedAtIso: order.placed_at,
    pickupSlot: order.pickup_slot,
    location: locationLabel(order.pickup_location_id),
    status: order.status,
    items,
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

/** Cancels an order by id. The RLS UPDATE policy on `orders` is the real
 * enforcement (status must be placed/preparing and within the
 * cancellation window) — this just issues the update and refetches;
 * canCancelOrder() above is only the client-side mirror of that policy so
 * the button doesn't stay visible past the point it would actually work. */
async function cancelOrder(id: number) {
  const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw new Error(error.message);
  await fetchOrders();
}

/** Convenience wrapper for the common case of cancelling whichever order
 * is currently active. */
async function cancelActiveOrder() {
  if (!activeOrder.value) return;
  await cancelOrder(activeOrder.value.id);
}

export function useOrders() {
  // First call in the session: load orders once, then subscribe to live
  // updates. Every module state here is shared (module-level singleton),
  // so later calls just return it without refetching.
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
