import { executeTrade } from "./trading";
import { getDB } from "./db";

export function runBot(prices: any) {
  const db = getDB();
  const balance = db.wallet.balance;

  const strategies = db.strategies || {
    risk: 0.1, // % do saldo por trade
    minChange: 1, // % mínimo pra agir
  };

  Object.keys(prices).forEach((symbol) => {
    const data = prices[symbol];

    if (!data) return;

    const change = data.change24h;
    const price = data.price;

    const amountToUse = balance * strategies.risk;
    const amount = amountToUse / price;

    // 🟢 COMPRA se caiu muito
    if (change <= -strategies.minChange) {
      try {
        executeTrade({
          symbol,
          name: symbol,
          type: "buy",
          price,
          amount,
        });
        console.log("BOT BUY", symbol);
      } catch {}
    }

    // 🔴 VENDE se subiu muito
    if (change >= strategies.minChange) {
      try {
        executeTrade({
          symbol,
          name: symbol,
          type: "sell",
          price,
          amount,
        });
        console.log("BOT SELL", symbol);
      } catch {}
    }
  });
}