import type { DB } from "@/types/db";

const BRL_RATE = 5.2;

export function getCurrency(db: DB) {
  return db.wallet?.currency === "BRL" ? "BRL" : "USD";
}

export function convertFromUsd(value: number, currency: "USD" | "BRL") {
  return currency === "BRL" ? value * BRL_RATE : value;
}

export function convertToUsd(value: number, currency: "USD" | "BRL") {
  return currency === "BRL" ? value / BRL_RATE : value;
}

export function formatMoney(valueUsd: number, currency: "USD" | "BRL" = "USD") {
  const value = convertFromUsd(Number(valueUsd || 0), currency);

  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getCurrencyLabel(currency: "USD" | "BRL") {
  return currency === "BRL" ? "Real (BRL)" : "Dolar (USD)";
}
