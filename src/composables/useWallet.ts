import { reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { Database } from '@/services/database.types';

export type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'];

const balance = ref(0);
const transactions = reactive<WalletTransaction[]>([]);
const loaded = ref(false);
const loading = ref(false);

async function fetchWallet() {
  loading.value = true;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const [{ data: wallet }, { data: history }] = await Promise.all([
      supabase.from('wallets').select('balance').eq('user_id', userData.user.id).single(),
      supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (wallet) balance.value = wallet.balance;
    transactions.splice(0, transactions.length, ...(history ?? []));
    loaded.value = true;
  } finally {
    loading.value = false;
  }
}

async function topUp(amount: number, paymentMethodId?: string): Promise<number> {
  const { data, error } = await supabase.rpc('wallet_top_up', {
    p_amount: amount,
    p_payment_method_id: paymentMethodId ? Number(paymentMethodId) : null,
  });
  if (error) throw new Error(error.message);
  balance.value = data;
  await fetchWallet();
  return data;
}

async function withdraw(amount: number, paymentMethodId?: string): Promise<number> {
  const { data, error } = await supabase.rpc('wallet_withdraw', {
    p_amount: amount,
    p_payment_method_id: paymentMethodId ? Number(paymentMethodId) : null,
  });
  if (error) throw new Error(error.message);
  balance.value = data;
  await fetchWallet();
  return data;
}

async function payWithWallet(amount: number, orderId?: number, note?: string): Promise<number> {
  const { data, error } = await supabase.rpc('wallet_pay', {
    p_amount: amount,
    p_order_id: orderId ?? null,
    p_note: note ?? null,
  });
  if (error) throw new Error(error.message);
  balance.value = data;
  return data;
}

export function useWallet() {
  if (!loaded.value) fetchWallet();
  return { balance, transactions, loading, topUp, withdraw, payWithWallet, fetchWallet };
}
