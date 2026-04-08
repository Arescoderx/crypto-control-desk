import { getDB, getDefaultDB, saveDB } from "./db";
import type { Strategy, DB } from "@/types/db";

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

// 🤖 TOGGLE BOT
export function toggleBot() {
  const db: DB = getDB();

  const nextState = !db.bot.active;

  db.bot.active = nextState;
  db.bot.startedAt = nextState ? new Date().toISOString() : null;

  saveDB(db);
}

// 🔥 CRIAR ESTRATÉGIA
export function createStrategy(name: string) {
  const db: DB = getDB();

  const newStrategy: Strategy = {
    id: crypto.randomUUID(),
    name: name || "Nova Estratégia",
    active: false,
    risk: 0.1,
    minChange: 0.5,
    takeProfit: 2,
    stopLoss: 2,
    maxAllocationPerCoin: 0.3,
    minTradeValue: 10,
  };

  db.strategies.push(newStrategy);
  saveDB(db);
}

// 🔥 ATIVAR / DESATIVAR
export function toggleStrategy(id: string) {
  const db: DB = getDB();

  const s = db.strategies.find((s) => s.id === id);
  if (!s) return;

  s.active = !s.active;

  saveDB(db);
}

// 🔥 ATUALIZAR ESTRATÉGIA (ESSENCIAL)
export function updateStrategy(id: string, data: Partial<Strategy>) {
  const db: DB = getDB();

  const s = db.strategies.find((s) => s.id === id);
  if (!s) return;

  Object.assign(s, data);

  saveDB(db);
}

// 🔥 DELETAR ESTRATÉGIA
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