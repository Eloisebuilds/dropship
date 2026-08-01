"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CURRENCY_RATES, SUPPORTED_CURRENCIES } from "./currency-config";

const STORAGE_KEY = "favoritems_currency";

export const TOP_CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
] as const;

type CurrencyCode = (typeof TOP_CURRENCIES)[number]["code"];

const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = Object.fromEntries(
  Object.keys(CURRENCY_RATES).map((code) => [
    code,
    { symbol: code === "USD" ? "$" : code === "GBP" ? "£" : code === "JPY" || code === "CNY" ? "¥" : code === "AUD" ? "AU$" : code === "CAD" ? "CA$" : code === "CHF" ? "CHF" : code === "INR" ? "₹" : code === "KRW" ? "₩" : "€", rate: CURRENCY_RATES[code] },
  ])
);

function getInitialCurrency(): string {
  if (typeof window === "undefined") return "EUR";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) return saved;
  } catch {}
  return "EUR";
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  formatPrice: (baseEur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("EUR");

  useEffect(() => {
    setCurrencyState(getInitialCurrency());
  }, []);

  const setCurrency = useCallback((code: string) => {
    if (!CURRENCY_MAP[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }, []);

  const formatPrice = useCallback(
    (baseEur: number): string => {
      const info = CURRENCY_MAP[currency];
      if (!info) return `€${baseEur.toFixed(2)}`;
      const converted = baseEur * info.rate;
      if (info.rate > 100) {
        return `${info.symbol}${Math.round(converted).toLocaleString()}`;
      }
      return `${info.symbol}${converted.toFixed(2)}`;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: "EUR",
      setCurrency: () => {},
      formatPrice: (baseEur: number) => `€${baseEur.toFixed(2)}`,
    };
  }
  return ctx;
}

export function formatPrice(baseEur: number, currency: string): string {
  const info = CURRENCY_MAP[currency];
  if (!info) return `€${baseEur.toFixed(2)}`;
  const converted = baseEur * info.rate;
  if (info.rate > 100) {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toFixed(2)}`;
}

export function getConvertedPrice(baseEur: number, currency: string): number {
  const info = CURRENCY_MAP[currency];
  if (!info) return baseEur;
  return baseEur * info.rate;
}
