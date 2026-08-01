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

const MINOR_UNIT_DECIMALS: Record<string, number> = {
  EUR: 2,
  USD: 2,
  GBP: 2,
  JPY: 0,
  CNY: 2,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  INR: 2,
  KRW: 0,
};

export function getMinorUnitDecimals(currency: string): number {
  return MINOR_UNIT_DECIMALS[currency.toUpperCase()] ?? 2;
}

export function toMinorUnits(amountInMajor: number, currency: string): number {
  return Math.round(amountInMajor * Math.pow(10, getMinorUnitDecimals(currency)));
}

export function fromMinorUnits(amountInMinor: number, currency: string): number {
  return amountInMinor / Math.pow(10, getMinorUnitDecimals(currency));
}

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
  const code = (currency || "eur").toUpperCase();
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
