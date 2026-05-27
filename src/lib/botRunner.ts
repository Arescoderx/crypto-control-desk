import { runBot } from "./bot";
import { getDB } from "./db";

let interval: any = null;
let latestPrices: Record<string, any> = {};

export function startBot(prices: Record<string, any>) {
  latestPrices = prices;

  if (interval) return;

  interval = setInterval(() => {
    const db = getDB();

    if (!db.bot.active) return;

    runBot(latestPrices);
  }, 2000);
}

export function stopBot() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
