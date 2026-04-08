export type Strategy = {
  id: string;
  name: string;
  active: boolean;

  risk: number;
  minChange: number;
  takeProfit: number;
  stopLoss: number;
  maxAllocationPerCoin: number;
  minTradeValue: number;
};

export type Holding = {
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
};

export type Trade = {
  id: number;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  total: number;
  date: string;
  status: "completed";
  pnl?: number;
  source?: string;
};

export type BotState = {
  active: boolean;
  startedAt: string | null;
  lastActionBySymbol: Record<string, string>;
};

export type DB = {
  wallet: {
    balance: number;
    currency: "USD" | "BRL";
  };
  holdings: Holding[];
  trades: Trade[];
  history: {
    timestamp: string;
    label: string;
    value: number;
  }[];
  strategies: Strategy[];
  bot: BotState;
};