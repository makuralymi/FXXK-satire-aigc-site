export function countBillableChars(text: string): number {
  return text.replace(/\s+/g, "").length;
}

export function calculateRewritePrice(charCount: number): {
  units: number;
  totalPrice: number;
} {
  const safeCount = Math.max(0, charCount);
  const units = Math.max(1, Math.ceil(safeCount / 1000));
  const totalPrice = units * 8;

  return { units, totalPrice };
}
