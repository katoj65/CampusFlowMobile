import { computed, reactive, ref } from 'vue';
import { cardOutline, walletOutline, cashOutline } from 'ionicons/icons';

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

const walletBalance = ref(12.4);

const methods = reactive<PaymentMethod[]>([
  {
    id: 'wallet',
    type: 'wallet',
    label: 'Campus Wallet',
    detail: `€${walletBalance.value.toFixed(2)} balance`,
    icon: walletOutline,
    removable: false,
    isDefault: false,
  },
  {
    id: 'card-4242',
    type: 'card',
    label: 'Student Card',
    detail: '•••• 4242',
    icon: cardOutline,
    removable: true,
    isDefault: true,
  },
  {
    id: 'cash',
    type: 'cash',
    label: 'Cash on Pickup',
    detail: 'Pay at the counter',
    icon: cashOutline,
    removable: false,
    isDefault: false,
  },
]);

let cardCounter = 1;

function setDefault(id: string) {
  for (const method of methods) {
    method.isDefault = method.id === id;
  }
}

function removeMethod(id: string) {
  const index = methods.findIndex((m) => m.id === id);
  if (index === -1 || !methods[index].removable) return;
  const wasDefault = methods[index].isDefault;
  methods.splice(index, 1);
  if (wasDefault && methods.length) {
    methods[0].isDefault = true;
  }
}

function addCard(cardNumber: string, cardholderName: string) {
  const digits = cardNumber.replace(/\s+/g, '');
  const last4 = digits.slice(-4) || '0000';
  methods.push({
    id: `card-${Date.now()}-${cardCounter++}`,
    type: 'card',
    label: cardholderName.trim() || 'New Card',
    detail: `•••• ${last4}`,
    icon: cardOutline,
    removable: true,
    isDefault: false,
  });
}

function topUpWallet(amount: number) {
  walletBalance.value += amount;
  const wallet = methods.find((m) => m.id === 'wallet');
  if (wallet) wallet.detail = `€${walletBalance.value.toFixed(2)} balance`;
}

const defaultMethod = computed(() => methods.find((m) => m.isDefault) ?? methods[0]);

export function usePaymentMethods() {
  return { methods, walletBalance, setDefault, removeMethod, addCard, topUpWallet, defaultMethod };
}
