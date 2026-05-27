import { getDB, saveDB } from "./db";

export function executeTrade({
  symbol,
  name,
  type,
  price,
  amount,
  source,
}: {
  symbol: string;
  name: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  source?: string; // 🔥 NOVO (não quebra nada)
}) {
  const db = getDB();
  const total = price * amount;

  let pnl = undefined;

  // ======================
  // 🟢 BUY
  // ======================
  if (type === "buy") {
    if (db.wallet.balance < total) {
      throw new Error("Saldo insuficiente");
    }

    db.wallet.balance -= total;

    const existing = db.holdings.find((h: any) => h.symbol === symbol);

    if (existing) {
      const totalAmount = existing.amount + amount;

      existing.avgPrice =
        (existing.avgPrice * existing.amount + price * amount) / totalAmount;

      existing.amount = totalAmount;
    } else {
      db.holdings.push({
        symbol,
        name,
        amount,
        avgPrice: price,
      });
    }
  }

  // ======================
  // 🔴 SELL
  // ======================
  if (type === "sell") {
    const existing = db.holdings.find((h: any) => h.symbol === symbol);

    if (!existing || existing.amount < amount) {
      throw new Error("Saldo insuficiente do ativo");
    }

    pnl = (price - existing.avgPrice) * amount;

    existing.amount -= amount;
    db.wallet.balance += total;

    if (existing.amount <= 0) {
      db.holdings = db.holdings.filter((h: any) => h.symbol !== symbol);
    }
  }

  // ======================
  // 🧾 REGISTRO DO TRADE
  // ======================
  db.trades.unshift({
    id: Date.now(),
    symbol,
    name,
    type,
    price,
    amount,
    total,
    date: new Date().toISOString(),
    status: "completed",
    pnl,

    // 🔥 IMPORTANTE: identifica de qual estratégia veio
    source: source || "manual",
  });

  saveDB(db);
}