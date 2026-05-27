import { getDB, getDefaultDB, saveDB } from "./db";
import type { Strategy, DB } from "@/types/db";

const ALLOWED_SYMBOLS = ["BTC", "ETH", "BNB", "DOGE", "ADA", "SOL"];

// 🔄 RESET TOTAL
export function resetAccount() {
  const fresh = getDefaultDB();
  saveDB(fresh);
}

// 💰 ATUALIZA SALDO
export function updateBalance(newBalance: number) {
  const db: DB = getDB();
  db.wallet.balance = newBalance;
  saveDB(db);
}

// 💱 ALTERA MOEDA
export function updateCurrency(currency: "USD" | "BRL") {
  const db: DB = getDB();
  db.wallet.currency = currency;
  saveDB(db);
}

// 🧹 LIMPA TRADES
export function clearTrades() {
  const db: DB = getDB();
  db.trades = [];
  saveDB(db);
}

export function clearSignals() {
  const db: DB = getDB();
  db.signals = [];
  saveDB(db);
}

// 🤖 TOGGLE BOT
export function toggleBot() {
  const db: DB = getDB();

  const nextState = !db.bot.active;

  db.bot.active = nextState;
  db.bot.startedAt = nextState ? new Date().toISOString() : null;

  saveDB(db);
}

// ======================
// 🔥 CRIAR ESTRATÉGIA (FIXADO)
// ======================
export function createStrategy(name: string) {
  const db: DB = getDB();

  const newStrategy: Strategy = {
    id: `strategy_${Date.now()}`, // 🔥 ALTERADO
    name: name || `Estratégia ${db.strategies.length + 1}`,
    active: true,
    symbols: ["BTC"],
    risk: 0.1,
    minChange: 0.5,
    takeProfit: 2,
    stopLoss: 2,
    maxAllocationPerCoin: 0.3,
    minTradeValue: 10,
  };

  db.strategies.push(newStrategy);
  saveDB(db);

  return newStrategy;
}

// ======================
// 🔘 TOGGLE
// ======================
export function toggleStrategy(id: string) {
  const db: DB = getDB();

  const s = db.strategies.find((s) => s.id === id);
  if (!s) return;

  s.active = !s.active;

  saveDB(db);
}

// ======================
// ✏️ UPDATE
// ======================
export function updateStrategy(id: string, data: Partial<Strategy>) {
  const db: DB = getDB();

  const s = db.strategies.find((s) => s.id === id);
  if (!s) return;

  const nextData = { ...data };

  if (nextData.symbols) {
    nextData.symbols = nextData.symbols.filter((symbol) =>
      ALLOWED_SYMBOLS.includes(symbol)
    );

    if (nextData.symbols.length === 0) {
      nextData.symbols = s.symbols;
    }
  }

  Object.assign(s, nextData);

  saveDB(db);
}

// ======================
// ❌ DELETE
// ======================
export function deleteStrategy(id: string) {
  const db: DB = getDB();

  db.strategies = db.strategies.filter((s) => s.id !== id);

  saveDB(db);
}

// 📤 EXPORT CSV
export function exportData() {
  const db = getDB();
  const trades = db.trades || [];

  if (trades.length === 0) {
    alert("Nenhum trade para exportar");
    return;
  }

  const headers = [
    "Data",
    "Ativo",
    "Tipo",
    "Preço",
    "Quantidade",
    "Total",
    "P&L",
    "Status",
    "Origem",
  ];

  const rows = trades.map((t: any) => [
    new Date(t.date).toLocaleString("pt-BR"),
    t.symbol,
    t.type === "buy" ? "Compra" : "Venda",
    t.price,
    t.amount,
    t.total,
    t.pnl ?? "",
    t.status || "completed",
    t.source || "manual",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.join(";"))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "trades.csv";
  a.click();

  URL.revokeObjectURL(url);
}

export function exportJson() {
  const db = getDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], {
    type: "application/json;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "crypto-control-desk-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

export function importJson(json: string) {
  const parsed = JSON.parse(json);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSON invalido");
  }

  const current = getDB();
  const next: DB = {
    ...current,
    ...parsed,
    wallet: {
      ...current.wallet,
      ...(parsed.wallet || {}),
    },
    bot: {
      ...current.bot,
      ...(parsed.bot || {}),
    },
    holdings: Array.isArray(parsed.holdings) ? parsed.holdings : current.holdings,
    trades: Array.isArray(parsed.trades) ? parsed.trades : current.trades,
    signals: Array.isArray(parsed.signals) ? parsed.signals : current.signals,
    history: Array.isArray(parsed.history) ? parsed.history : current.history,
    strategies: Array.isArray(parsed.strategies)
      ? parsed.strategies.map((strategy: Strategy) => {
          const symbols = Array.isArray(strategy.symbols)
            ? strategy.symbols.filter((symbol) => ALLOWED_SYMBOLS.includes(symbol))
            : ["BTC"];

          return {
            ...strategy,
            symbols: symbols.length > 0 ? symbols : ["BTC"],
          };
        })
      : current.strategies,
  };

  saveDB(next);
}
