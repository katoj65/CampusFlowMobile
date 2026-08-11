/** Groups digits into "1234 5678 9012 3456" as the user types, capped at 16 digits. */
export function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Masks to "MM/YY" as the user types, capped at 4 digits. */
export function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function isValidCardEntry(cardNumber: string, cardholderName: string, expiry: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.length >= 12 && cardholderName.trim().length > 0 && /^\d{2}\/\d{2}$/.test(expiry);
}
