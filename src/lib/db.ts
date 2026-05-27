import type { DB } from "@/types/db";

const STORAGE_KEY = "crypto-db";
const ALLOWED_SYMBOLS = ["BTC", "ETH", "BNB", "DOGE", "ADA", "SOL"];

export function getDefaultDB(): DB {
  return {
    wallet: {
      balance: 100000,
      currency: "USD",
    },

    holdings: [],

    trades: [],

    signals: [],

    history: [],

    strategies: [
      {
        id: "default",
        name: "Estratégia Padrão",
        active: true,
        symbols: ["BTC"],
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

      // 🔥 NOVOS CAMPOS (NÃO QUEBRA NADA)
      lastActionByStrategySymbol: {},
      priceHistoryBySymbol: {},
      positionsByStrategy: {},
    },
  };
}

function normalizeDB(raw: any): DB {
  const defaults = getDefaultDB();
  const seenStrategyIds = new Set<string>();

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

    holdings: Array.isArray(raw?.holdings)
      ? raw.holdings
      : defaults.holdings,

    trades: Array.isArray(raw?.trades)
      ? raw.trades
      : defaults.trades,

    signals: Array.isArray(raw?.signals)
      ? raw.signals
      : defaults.signals,

    history: Array.isArray(raw?.history)
      ? raw.history
      : defaults.history,

    strategies: Array.isArray(raw?.strategies)
      ? raw.strategies.map((strategy: any, index: number) => {
          const selectedSymbols = Array.isArray(strategy?.symbols)
            ? strategy.symbols.filter((symbol: string) =>
                ALLOWED_SYMBOLS.includes(symbol)
              )
            : ["BTC"];
          const rawId =
            typeof strategy?.id === "string" && strategy.id.trim()
              ? strategy.id
              : `strategy_${Date.now()}_${index}`;
          const id = seenStrategyIds.has(rawId)
            ? `${rawId}_${index}`
            : rawId;

          seenStrategyIds.add(id);

          return {
            ...strategy,
            id,
            symbols: selectedSymbols.length > 0 ? selectedSymbols : ["BTC"],
          };
        })
      : defaults.strategies,

    bot: {
      active:
        typeof raw?.bot?.active === "boolean"
          ? raw.bot.active
          : defaults.bot.active,

      startedAt:
        typeof raw?.bot?.startedAt === "string" ||
        raw?.bot?.startedAt === null
          ? raw.bot.startedAt
          : defaults.bot.startedAt,

      lastActionBySymbol:
        raw?.bot?.lastActionBySymbol &&
        typeof raw.bot.lastActionBySymbol === "object"
          ? raw.bot.lastActionBySymbol
          : defaults.bot.lastActionBySymbol,

      // 🔥 NOVOS CAMPOS COM FALLBACK (IMPORTANTE)
      lastActionByStrategySymbol:
        raw?.bot?.lastActionByStrategySymbol &&
        typeof raw.bot.lastActionByStrategySymbol === "object"
          ? raw.bot.lastActionByStrategySymbol
          : defaults.bot.lastActionByStrategySymbol,

      priceHistoryBySymbol:
        raw?.bot?.priceHistoryBySymbol &&
        typeof raw.bot.priceHistoryBySymbol === "object"
          ? raw.bot.priceHistoryBySymbol
          : defaults.bot.priceHistoryBySymbol,

      positionsByStrategy:
        raw?.bot?.positionsByStrategy &&
        typeof raw.bot.positionsByStrategy === "object"
          ? raw.bot.positionsByStrategy
          : defaults.bot.positionsByStrategy,
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
