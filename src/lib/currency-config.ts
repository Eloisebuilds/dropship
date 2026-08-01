export const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  JPY: 163.5,
  CNY: 7.85,
  AUD: 1.65,
  CAD: 1.47,
  CHF: 0.97,
  INR: 90.2,
  KRW: 1450,
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_RATES);

export function convertFromEur(baseEur: number, currency: string): number {
  const rate = CURRENCY_RATES[currency];
  if (!rate) return baseEur;
  return baseEur * rate;
}

export function formatPrice(baseEur: number, currency: string): string {
  const rate = CURRENCY_RATES[currency];
  if (!rate) return `€${baseEur.toFixed(2)}`;
  const converted = baseEur * rate;
  const symbol =
    currency === "USD" ? "$"
    : currency === "GBP" ? "£"
    : currency === "JPY" || currency === "CNY" ? "¥"
    : currency === "AUD" ? "AU$"
    : currency === "CAD" ? "CA$"
    : currency === "CHF" ? "CHF"
    : currency === "INR" ? "₹"
    : currency === "KRW" ? "₩"
    : "€";
  if (rate > 100) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}

export function formatAmountInCurrency(amount: number, currency: string): string {
  const code = (currency || "usd").toUpperCase();
  const symbol =
    code === "USD" ? "$"
    : code === "GBP" ? "£"
    : code === "JPY" || code === "CNY" ? "¥"
    : code === "AUD" ? "AU$"
    : code === "CAD" ? "CA$"
    : code === "CHF" ? "CHF"
    : code === "INR" ? "₹"
    : code === "KRW" ? "₩"
    : "€";
  if (code === "JPY" || code === "KRW") {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}
