import { getDB, saveDB } from "./db";
import { executeTrade } from "./trading";
import type { DB, ExternalSignal, Strategy } from "@/types/db";

const COOLDOWN_SECONDS = 30;
const DEMO_COOLDOWN_SECONDS = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function updatePriceHistory(db: DB, prices: Record<string, any>) {
  const now = new Date().toISOString();

  db.bot.priceHistoryBySymbol ||= {};

  for (const symbol of Object.keys(prices)) {
    const price = Number(prices[symbol]?.price || 0);
    if (!price) continue;

    const current = db.bot.priceHistoryBySymbol[symbol] || [];
    db.bot.priceHistoryBySymbol[symbol] = [
      ...current,
      { price, timestamp: now },
    ].slice(-200);
  }
}

function getSignalAmount(signal: ExternalSignal, db: DB, price: number) {
  if (signal.action === "buy") {
    return signal.amount || (signal.amountUsd ? signal.amountUsd / price : 0);
  }

  const holding = db.holdings.find((item) => item.symbol === signal.symbol);
  return signal.amount || holding?.amount || 0;
}

function markSignal(
  db: DB,
  signalId: string,
  status: "executed" | "ignored"
) {
  const signal = db.signals.find((item) => item.id === signalId);

  if (!signal) return;

  signal.status = status;
  signal.executedAt = new Date().toISOString();
}

function getPortfolioValue(db: DB, prices: Record<string, any>) {
  const cash = db.wallet?.balance || 0;
  const holdingsValue = db.holdings.reduce((sum, holding) => {
    const price = Number(prices[holding.symbol]?.price || holding.avgPrice || 0);
    return sum + holding.amount * price;
  }, 0);

  return cash + holdingsValue;
}

function isDemoStrategy(strategy: Strategy) {
  return Number(strategy.minChange || 0) <= 0;
}

function canRunStrategy(db: DB, strategy: Strategy, symbol: string) {
  db.bot.lastActionByStrategySymbol ||= {};

  const key = `${strategy.id}::${symbol}`;
  const lastAction = db.bot.lastActionByStrategySymbol[key];

  if (!lastAction) return true;

  const seconds = (Date.now() - new Date(lastAction).getTime()) / 1000;
  return seconds >= (isDemoStrategy(strategy) ? DEMO_COOLDOWN_SECONDS : COOLDOWN_SECONDS);
}

function markStrategyAction(db: DB, strategy: Strategy, symbol: string) {
  db.bot.lastActionByStrategySymbol ||= {};
  db.bot.lastActionByStrategySymbol[`${strategy.id}::${symbol}`] =
    new Date().toISOString();
  db.bot.lastActionBySymbol[symbol] = new Date().toISOString();
}

function runStrategies(prices: Record<string, any>) {
  let db = getDB();
  const activeStrategies = db.strategies.filter(
    (strategy) => strategy.active && strategy.symbols.length > 0
  );

  for (const strategy of activeStrategies) {
    for (const symbol of strategy.symbols) {
      db = getDB();

      if (!canRunStrategy(db, strategy, symbol)) continue;

      const live = prices[symbol];
      const price = Number(live?.price || 0);
      const change24h = Number(live?.change24h || 0);

      if (!price) continue;

      const holding = db.holdings.find((item) => item.symbol === symbol);
      const balance = db.wallet?.balance || 0;
      const portfolioValue = getPortfolioValue(db, prices);
      const risk = clamp(Number(strategy.risk || 0.1), 0.01, 0.5);
      const minChange = Math.abs(Number(strategy.minChange || 0.5));
      const demoMode = isDemoStrategy(strategy);
      const takeProfit = Math.abs(Number(strategy.takeProfit || 2));
      const stopLoss = Math.abs(Number(strategy.stopLoss || 2));
      const maxAllocation = clamp(
        Number(strategy.maxAllocationPerCoin || 0.3),
        0.01,
        1
      );
      const minTradeValue = Math.max(Number(strategy.minTradeValue || 10), 1);
      const tradePrice = demoMode
        ? price * (holding ? 0.998 : 1.002)
        : price;

      const currentCoinValue = holding ? holding.amount * tradePrice : 0;
      const maxCoinValue = portfolioValue * maxAllocation;
      const availableAllocation = Math.max(0, maxCoinValue - currentCoinValue);
      const tradeValue = Math.min(balance * risk, availableAllocation);

      const shouldBuy =
        !holding &&
        (demoMode || change24h <= -minChange) &&
        tradeValue >= minTradeValue &&
        balance >= tradeValue;

      const hitTakeProfit =
        !!holding && tradePrice >= holding.avgPrice * (1 + takeProfit / 100);

      const hitStopLoss =
        !!holding && tradePrice <= holding.avgPrice * (1 - stopLoss / 100);

      const shouldSellByChange = !!holding && (demoMode || change24h >= minChange);
      const shouldSell = hitTakeProfit || hitStopLoss || shouldSellByChange;

      try {
        if (shouldBuy) {
          executeTrade({
            symbol,
            name: symbol,
            type: "buy",
            price: tradePrice,
            amount: tradeValue / tradePrice,
            source: strategy.id,
          });

          db = getDB();
          markStrategyAction(db, strategy, symbol);
          saveDB(db);
          continue;
        }

        if (holding && shouldSell) {
          executeTrade({
            symbol,
            name: holding.name || symbol,
            type: "sell",
            price: tradePrice,
            amount: holding.amount,
            source: strategy.id,
          });

          db = getDB();
          markStrategyAction(db, strategy, symbol);
          saveDB(db);
        }
      } catch {
        // Mantem o bot rodando mesmo se uma estrategia nao puder operar.
      }
    }
  }
}

export function runBot(prices: Record<string, any>) {
  if (!prices || Object.keys(prices).length === 0) return;

  let db = getDB();

  updatePriceHistory(db, prices);
  saveDB(db);

  if (!db.bot?.active) return;

  const pendingSignals = (db.signals || []).filter(
    (signal) => signal.status === "pending"
  );

  for (const signal of pendingSignals) {
    db = getDB();

    if (signal.action === "hold") {
      markSignal(db, signal.id, "ignored");
      saveDB(db);
      continue;
    }

    const livePrice = Number(prices[signal.symbol]?.price || signal.price || 0);
    if (!livePrice) continue;

    const amount = getSignalAmount(signal, db, livePrice);
    if (!amount || amount <= 0) continue;

    try {
      executeTrade({
        symbol: signal.symbol,
        name: signal.name || signal.symbol,
        type: signal.action,
        price: livePrice,
        amount,
        source: signal.id,
      });

      db = getDB();
      markSignal(db, signal.id, "executed");
      db.bot.lastActionBySymbol[signal.symbol] = new Date().toISOString();
      saveDB(db);
    } catch {
      // Mantem o sinal pendente para o usuario revisar saldo, quantidade ou preco.
    }
  }

  runStrategies(prices);
}
