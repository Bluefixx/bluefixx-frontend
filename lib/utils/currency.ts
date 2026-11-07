/**
 * Currency utilities for converting between integer kobo and Nigerian Naira (₦).
 * All monetary amounts sent to the BlueFixx backend use integer kobo (e.g., ₦1,000 = 100,000 kobo).
 */

/**
 * Convert kobo (number or string) to Naira number.
 */
export function koboToNaira(kobo: number | string | null | undefined): number {
  if (kobo === null || kobo === undefined || kobo === "") return 0;
  const num = typeof kobo === "string" ? parseFloat(kobo) : kobo;
  if (isNaN(num)) return 0;
  return num / 100;
}

/**
 * Convert Naira amount to integer kobo.
 */
export function nairaToKobo(naira: number | string | null | undefined): number {
  if (naira === null || naira === undefined || naira === "") return 0;
  const num = typeof naira === "string" ? parseFloat(naira) : naira;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Format a Naira or Kobo amount with commas and the ₦ symbol.
 * If isKobo is true, converts from kobo first.
 */
export function formatNaira(
  amount: number | string | null | undefined,
  isKobo = false
): string {
  if (amount === null || amount === undefined || amount === "") return "₦0";
  const naira = isKobo ? koboToNaira(amount) : typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(naira)) return "₦0";
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

