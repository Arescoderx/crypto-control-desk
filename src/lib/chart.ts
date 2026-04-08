import { getDB, saveDB } from "./db";

export function updatePortfolioHistory(prices: any) {
  const db = getDB();

  const holdings = db.holdings || [];
  const balance = db.wallet?.balance || 0;

  let portfolioValue = balance;

  holdings.forEach((h: any) => {
    const live = prices[h.symbol];
    const price = live?.price || h.avgPrice;

    portfolioValue += h.amount * price;
  });

  db.history = db.history || [];

  db.history.push({
    date: new Date().toLocaleTimeString(),
    value: portfolioValue,
  });

  // 🔥 limita histórico (últimos 50 pontos)
  if (db.history.length > 50) {
    db.history.shift();
  }

  saveDB(db);
}