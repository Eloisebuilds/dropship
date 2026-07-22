const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1.08 },
  EUR: { symbol: "€", rate: 1 },
  GBP: { symbol: "£", rate: 0.86 },
};

export function formatPrice(baseEur: number, currency: string = "USD"): string {
  const info = CURRENCY_MAP[currency];
  if (!info) return `€${baseEur.toFixed(2)}`;
  const converted = baseEur * info.rate;
  return `${info.symbol}${converted.toFixed(2)}`;
}
