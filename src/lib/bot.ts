import { getDB, saveDB } from "./db";
import { executeTrade } from "./trading";
import type { DB } from "@/types/db";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPortfolioValue(db: any, prices: Record<string, any>) {
  const balance = db.wallet?.balance || 0;
  const holdingsValue = (db.holdings || []).reduce((sum: number, holding: any) => {
    const livePrice = prices?.[holding.symbol]?.price || holding.avgPrice || 0;
    return sum + holding.amount * livePrice;
  }, 0);

  return balance + holdingsValue;
}

function canRunForSymbol(db: any, symbol: string) {
  const lastAction = db.bot?.lastActionBySymbol?.[symbol];
  if (!lastAction) return true;

  const seconds = (Date.now() - new Date(lastAction).getTime()) / 1000;

  // cooldown por moeda
  return seconds >= 30;
}

export function runBot(prices: Record<string, any>) {
  if (!prices || Object.keys(prices).length === 0) return;

  const initialDb = getDB();
  if (!initialDb.bot?.active) return;

  for (const symbol of Object.keys(prices)) {
    let db: DB = getDB();

    if (!canRunForSymbol(db, symbol)) continue;

    const live = prices[symbol];
    if (!live?.price) continue;

    const price = live.price;
    const change24h = live.change24h || 0;

    const activeStrategies = db.strategies.filter((s) => s.active);

    if (activeStrategies.length === 0) continue;

    for (const strategy of activeStrategies) {
      const risk = clamp(Number(strategy.risk || 0.1), 0.01, 0.5);
      const minChange = Number(strategy.minChange || 1);
      const takeProfit = Number(strategy.takeProfit || 3);
      const stopLoss = Number(strategy.stopLoss || 2);
      const maxAllocationPerCoin = clamp(
        Number(strategy.maxAllocationPerCoin || 0.35),
        0.05,
        0.8
      );
      const minTradeValue = Number(strategy.minTradeValue || 25);

      const holding = db.holdings.find((h) => h.symbol === symbol);
      const balance = db.wallet?.balance || 0;
      const totalPortfolio = getPortfolioValue(db, prices);

      const currentCoinValue = holding ? holding.amount * price : 0;
      const maxCoinValue = totalPortfolio * maxAllocationPerCoin;
      const remainingAllocation = Math.max(0, maxCoinValue - currentCoinValue);

      const desiredTradeValue = Math.min(balance * risk, remainingAllocation);

      const shouldBuy =
        (
          change24h <= -minChange // queda
          ||
          Math.random() < 0.05 // 👈 fallback (5% chance)
        ) &&
        desiredTradeValue >= minTradeValue &&
        balance >= desiredTradeValue &&
        currentCoinValue < maxCoinValue;

      const hitTakeProfit =
        !!holding && price >= holding.avgPrice * (1 + takeProfit / 100);

      const hitStopLoss =
        !!holding && price <= holding.avgPrice * (1 - stopLoss / 100);

      const shouldSellByMomentum =
        !!holding && (
          change24h >= minChange ||
          Math.random() < 0.05
        );

      try {
        if (shouldBuy) {
          const amount = desiredTradeValue / price;

          executeTrade({
            symbol,
            name: holding?.name || symbol,
            type: "buy",
            price,
            amount,
          });

          db = getDB();
          db.trades[0].source = "bot";
          db.bot.lastActionBySymbol[symbol] = new Date().toISOString();
          saveDB(db);

          continue;
        }

        if (holding && (hitTakeProfit || hitStopLoss || shouldSellByMomentum)) {
          const amount = hitTakeProfit || hitStopLoss
            ? holding.amount
            : holding.amount * 0.5;

          if (amount * price >= minTradeValue || amount === holding.amount) {
            executeTrade({
              symbol,
              name: holding.name || symbol,
              type: "sell",
              price,
              amount,
            });

            db = getDB();
            db.trades[0].source = strategy.id;
            db.bot.lastActionBySymbol[symbol] = new Date().toISOString();
            saveDB(db);
          }
        }
      } catch {
        // silencioso para não quebrar a UI
      }
    }
  }
}