import { runBot } from "./bot";
import { getDB } from "./db";

let interval: any = null;

export function startBot(prices: Record<string, any>) {
  if (interval) return;

  interval = setInterval(() => {
    const db = getDB();

    if (!db.bot.active) return;

    runBot(prices);
  }, 5000);
}

export function stopBot() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}