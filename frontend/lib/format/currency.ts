/**
 * Centralized currency formatter & converter for GlobeTrotter.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "CAD" | "AUD";

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1.0, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.79, label: "GBP (£)" },
  JPY: { symbol: "¥", rate: 154.5, label: "JPY (¥)" },
  INR: { symbol: "₹", rate: 86.8, label: "INR (₹)" },
  CAD: { symbol: "CA$", rate: 1.38, label: "CAD ($)" },
  AUD: { symbol: "A$", rate: 1.52, label: "AUD ($)" },
};

export function getSelectedCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  const stored = localStorage.getItem("preferred_currency");
  if (stored && stored in CURRENCY_RATES) return stored as CurrencyCode;
  return "USD";
}

export function setSelectedCurrency(currency: CurrencyCode) {
  if (typeof window !== "undefined") {
    localStorage.setItem("preferred_currency", currency);
    window.dispatchEvent(new Event("currency_change"));
  }
}

export function formatCurrency(
  amount: number | string | undefined | null,
  targetCurrency?: CurrencyCode
): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return "$0";

  const curr = targetCurrency || (typeof window !== "undefined" ? getSelectedCurrency() : "USD");
  const meta = CURRENCY_RATES[curr] || CURRENCY_RATES.USD;
  const converted = num * meta.rate;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: curr === "JPY" ? 0 : 0,
    minimumFractionDigits: 0,
  }).format(converted);
}
