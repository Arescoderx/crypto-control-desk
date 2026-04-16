import { getDB, saveDB } from "./db";

export function calculatePortfolioValue(prices: Record<string, any>) {
  const db = getDB();

  const balance = db.wallet?.balance || 0;
  const holdings = db.holdings || [];

  const holdingsValue = holdings.reduce((sum: number, holding: any) => {
    const livePrice = prices?.[holding.symbol]?.price || holding.avgPrice || 0;
    return sum + holding.amount * livePrice;
  }, 0);

  return balance + holdingsValue;
}

export function updatePortfolioHistory(
  prices: Record<string, any>,
  force = false
) {
  if (!prices || Object.keys(prices).length === 0) return;

  const db = getDB();
  const portfolioValue = calculatePortfolioValue(prices);

  db.history = Array.isArray(db.history) ? db.history : [];

  const now = new Date();
  const label = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lastPoint = db.history[db.history.length - 1];

  if (!force && lastPoint) {
    const lastTimestamp = new Date(lastPoint.timestamp).getTime();
    const secondsSinceLast = (Date.now() - lastTimestamp) / 1000;
    const percentageDiff =
      lastPoint.value > 0
        ? Math.abs(((portfolioValue - lastPoint.value) / lastPoint.value) * 100)
        : 0;

    // Evita gravar ponto toda hora sem necessidade
    if (secondsSinceLast < 15 && percentageDiff < 0.05) {
      return;
    }
  }

  db.history.push({
    timestamp: now.toISOString(),
    label,
    value: Number(portfolioValue.toFixed(2)),
  });

  if (db.history.length > 120) {
    db.history = db.history.slice(-120);
  }

  saveDB(db);
}