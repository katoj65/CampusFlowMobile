import { computed, reactive } from 'vue';

export interface CartLine {
  lineId: string;
  mealId: number;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  summary: string;
}

const lines = reactive<CartLine[]>([]);

function addToCart(line: Omit<CartLine, 'lineId'>) {
  lines.push({ ...line, lineId: `${line.mealId}-${Date.now()}` });
}

function removeLine(lineId: string) {
  const index = lines.findIndex((line) => line.lineId === lineId);
  if (index !== -1) lines.splice(index, 1);
}

function updateQty(lineId: string, qty: number) {
  const line = lines.find((l) => l.lineId === lineId);
  if (line) line.qty = Math.max(1, qty);
}

function clearCart() {
  lines.splice(0, lines.length);
}

const itemCount = computed(() => lines.reduce((sum, line) => sum + line.qty, 0));
const subtotal = computed(() => lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0));

export function useCart() {
  return { lines, addToCart, removeLine, updateQty, clearCart, itemCount, subtotal };
}
