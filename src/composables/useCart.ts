import { computed, reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface CartLine {
  lineId: string;
  mealId: number;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  summary: string;
  extras: string[];
  extrasTotal: number;
}

const lines = reactive<CartLine[]>([]);
const loaded = ref(false);

let channel: ReturnType<typeof supabase.channel> | null = null;

function subscribeToCart(userId: string) {
  if (channel) return;
  channel = supabase
    .channel('cart-items-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${userId}` },
      () => fetchCart()
    )
    .subscribe();
}

async function fetchCart() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: true });

  lines.splice(
    0,
    lines.length,
    ...(data ?? []).map((row) => ({
      lineId: String(row.id),
      mealId: row.meal_id,
      name: row.name,
      image: row.image_url,
      unitPrice: row.unit_price,
      qty: row.qty,
      summary: row.summary,
      extras: row.extras,
      extrasTotal: row.extras_total_price,
    }))
  );
  loaded.value = true;
}

/** Pushes the line immediately (optimistic), then persists — rolled back on failure. */
async function addToCart(line: Omit<CartLine, 'lineId'>) {
  const tempId = `temp-${Date.now()}`;
  lines.push({ ...line, lineId: tempId });

  const rollback = () => {
    const i = lines.findIndex((l) => l.lineId === tempId);
    if (i !== -1) lines.splice(i, 1);
  };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    rollback();
    throw new Error('Not signed in');
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userData.user.id,
      meal_id: line.mealId,
      name: line.name,
      image_url: line.image,
      unit_price: line.unitPrice,
      qty: line.qty,
      summary: line.summary,
      extras: line.extras,
      extras_total_price: line.extrasTotal,
    })
    .select()
    .single();

  if (error || !data) {
    rollback();
    throw new Error(error?.message ?? 'Could not add item to cart');
  }

  const optimistic = lines.find((l) => l.lineId === tempId);
  if (optimistic) optimistic.lineId = String(data.id);
}

async function removeLine(lineId: string) {
  const index = lines.findIndex((line) => line.lineId === lineId);
  if (index === -1) return;
  const [removed] = lines.splice(index, 1);

  // A plain delete() doesn't error when zero rows match (wrong id, RLS,
  // already-gone row) — it just silently "succeeds". Selecting the deleted
  // row back is the only way to confirm it was actually removed.
  const { data, error } = await supabase.from('cart_items').delete().eq('id', Number(lineId)).select().maybeSingle();
  if (error || !data) {
    lines.splice(index, 0, removed);
    throw new Error(error?.message ?? 'Could not remove item — it may already be gone.');
  }
}

async function updateQty(lineId: string, qty: number) {
  const line = lines.find((l) => l.lineId === lineId);
  if (!line) return;
  const clamped = Math.max(1, Math.min(10, qty));
  const previous = line.qty;
  line.qty = clamped;

  // Same reasoning as removeLine — confirm a row actually came back rather
  // than trusting the absence of an error.
  const { data, error } = await supabase
    .from('cart_items')
    .update({ qty: clamped, updated_at: new Date().toISOString() })
    .eq('id', Number(lineId))
    .select()
    .maybeSingle();
  if (error || !data) {
    line.qty = previous;
    throw new Error(error?.message ?? 'Could not update quantity — the item may no longer exist.');
  }
}

async function clearCart() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const previous = [...lines];
  lines.splice(0, lines.length);

  const { error } = await supabase.from('cart_items').delete().eq('user_id', userData.user.id);
  if (error) {
    lines.splice(0, lines.length, ...previous);
    throw new Error(error.message);
  }
}

const itemCount = computed(() => lines.reduce((sum, line) => sum + line.qty, 0));
const subtotal = computed(() => lines.reduce((sum, line) => sum + line.unitPrice * line.qty + line.extrasTotal, 0));

export function useCart() {
  if (!loaded.value) {
    fetchCart().then(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) subscribeToCart(userData.user.id);
    });
  }
  return { lines, loaded, addToCart, removeLine, updateQty, clearCart, itemCount, subtotal, fetchCart };
}
