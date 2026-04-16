import type { DB } from "@/types/db";

const STORAGE_KEY = "crypto-db";

export function getDefaultDB(): DB {

  return {
    wallet: {
      balance: 100000,
      currency: "USD",
    },

    holdings: [],

    trades: [],

    history: [],

    strategies: [
      {
        id: "default",
        name: "Estratégia Padrão",
        active: true,
        risk: 0.1,
        minChange: 0.3,
        takeProfit: 2,
        stopLoss: 2,
        maxAllocationPerCoin: 0.3,
        minTradeValue: 10,
      },
    ],

    bot: {
      active: false,
      startedAt: null,
      lastActionBySymbol: {},
    },
  };
}

function normalizeDB(raw: any): DB {
  const defaults = getDefaultDB();

  return {
    wallet: {
      balance:
        typeof raw?.wallet?.balance === "number"
          ? raw.wallet.balance
          : defaults.wallet.balance,

      currency:
        raw?.wallet?.currency === "BRL" || raw?.wallet?.currency === "USD"
          ? raw.wallet.currency
          : defaults.wallet.currency,
    },

    holdings: Array.isArray(raw?.holdings) ? raw.holdings : defaults.holdings,

    trades: Array.isArray(raw?.trades) ? raw.trades : defaults.trades,

    history: Array.isArray(raw?.history) ? raw.history : defaults.history,

    strategies: Array.isArray(raw?.strategies)
      ? raw.strategies
      : defaults.strategies,
      
    bot: {
      active:
        typeof raw?.bot?.active === "boolean"
          ? raw.bot.active
          : defaults.bot.active,

      startedAt:
        typeof raw?.bot?.startedAt === "string" || raw?.bot?.startedAt === null
          ? raw.bot.startedAt
          : defaults.bot.startedAt,

      lastActionBySymbol:
        raw?.bot?.lastActionBySymbol &&
          typeof raw.bot.lastActionBySymbol === "object"
          ? raw.bot.lastActionBySymbol
          : defaults.bot.lastActionBySymbol,
    },
  };
}

export function getDB(): DB {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initial = getDefaultDB();
    saveDB(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeDB(parsed);
    saveDB(normalized);
    return normalized;
  } catch {
    const fallback = getDefaultDB();
    saveDB(fallback);
    return fallback;
  }
}

export function saveDB(data: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}