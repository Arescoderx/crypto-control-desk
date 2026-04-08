import { getDB } from "./db";

export function getDashboardData(prices: any) {
  const db = getDB();

  const holdings = db.holdings || [];
  const balance = db.wallet.balance;

  let portfolioValue = 0;

  const enrichedHoldings = holdings.map((h: any) => {
    const livePrice = prices[h.symbol]?.price || h.avgPrice;
    const value = h.amount * livePrice;

    portfolioValue += value;

    return {
      ...h,
      currentPrice: livePrice,
      value,
      pnl: (livePrice - h.avgPrice) * h.amount,
    };
  });

  const totalValue = balance + portfolioValue;

  return {
    balance,
    portfolioValue,
    totalValue,
    holdings: enrichedHoldings,
  };
}