// Saved payment methods (`payment_methods`) — wallet/cash rows are seeded
// per-user by the handle_new_user() signup trigger, cards are user-added.
import { computed, reactive, ref, watch } from 'vue';
import { cardOutline, walletOutline, cashOutline } from 'ionicons/icons';
import { supabase } from '@/services/supabase';
import { useWallet } from './useWallet';
import { formatCurrency } from '@/utils/currency';

export type PaymentMethodType = 'card' | 'wallet' | 'cash';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  icon: string;
  removable: boolean;
  isDefault: boolean;
}

// The wallet balance lives once in useWallet (backed by the wallets table)
// — this just mirrors it into the wallet entry's display text below.
const { balance } = useWallet();

const methods = reactive<PaymentMethod[]>([]);
const loaded = ref(false);

function iconFor(type: PaymentMethodType): string {
  if (type === 'wallet') return walletOutline;
  if (type === 'cash') return cashOutline;
  return cardOutline;
}

/** Loads the signed-in user's payment methods, formatting the wallet
 * row's `detail` from the live balance rather than trusting whatever the
 * DB last had stored for it (balance can change independently). */
async function fetchMethods() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: true });
  if (!data) return;

  const mapped: PaymentMethod[] = data.map((row) => ({
    id: String(row.id),
    type: row.type,
    label: row.label,
    detail: row.type === 'wallet' ? `${formatCurrency(balance.value)} balance` : row.detail,
    icon: iconFor(row.type),
    removable: row.removable,
    isDefault: row.is_default,
  }));

  methods.splice(0, methods.length, ...mapped);
  loaded.value = true;
}

/** Flips is_default onto `id` and off the previous default, locally and
 * in the DB — both writes fire in parallel since neither depends on the
 * other's result. */
async function setDefault(id: string) {
  const target = methods.find((m) => m.id === id);
  if (!target || target.isDefault) return;
  const previousDefault = methods.find((m) => m.isDefault);

  target.isDefault = true;
  if (previousDefault) previousDefault.isDefault = false;

  await Promise.all([
    supabase.from('payment_methods').update({ is_default: true }).eq('id', Number(id)),
    previousDefault
      ? supabase.from('payment_methods').update({ is_default: false }).eq('id', Number(previousDefault.id))
      : null,
  ]);
}

/** Deletes a payment method (wallet/cash are removable: false, so this is
 * really only for cards). If the removed method was the default, the next
 * remaining method is promoted so there's always a default when one exists. */
async function removeMethod(id: string) {
  const index = methods.findIndex((m) => m.id === id);
  if (index === -1 || !methods[index].removable) return;
  const wasDefault = methods[index].isDefault;

  const { error } = await supabase.from('payment_methods').delete().eq('id', Number(id));
  if (error) throw new Error(error.message);

  methods.splice(index, 1);
  if (wasDefault && methods.length) {
    methods[0].isDefault = true;
    await supabase.from('payment_methods').update({ is_default: true }).eq('id', Number(methods[0].id));
  }
}

/** Adds a new card payment method. No real card validation/tokenization —
 * this app has no payment gateway integration yet, so it just stores the
 * last 4 digits for display. */
async function addCard(cardNumber: string, cardholderName: string): Promise<PaymentMethod> {
  // Step 1: derive the display detail from the raw input.
  const digits = cardNumber.replace(/\s+/g, '');
  const last4 = digits.slice(-4) || '0000';

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not signed in');

  // Step 2: insert — new cards are never the default and are always removable.
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userData.user.id,
      type: 'card',
      label: cardholderName.trim() || 'New Card',
      detail: `•••• ${last4}`,
      is_default: false,
      removable: true,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Could not save card');

  // Step 3: append to local state so the caller sees it immediately.
  const method: PaymentMethod = {
    id: String(data.id),
    type: data.type,
    label: data.label,
    detail: data.detail,
    icon: cardOutline,
    removable: data.removable,
    isDefault: data.is_default,
  };
  methods.push(method);
  return method;
}

// Keeps the wallet row's displayed balance in sync whenever useWallet's
// balance changes (top-up, withdrawal, or a wallet_pay at checkout).
watch(balance, (bal) => {
  const wallet = methods.find((m) => m.type === 'wallet');
  if (wallet) wallet.detail = `${formatCurrency(bal)} balance`;
});

const defaultMethod = computed(() => methods.find((m) => m.isDefault) ?? methods[0]);

export function usePaymentMethods() {
  if (!loaded.value) fetchMethods();
  return { methods, loaded, setDefault, removeMethod, addCard, defaultMethod, fetchMethods };
}
