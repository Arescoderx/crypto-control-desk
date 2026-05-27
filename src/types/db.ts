export type Strategy = {
  id: string;
  name: string;
  active: boolean;
  symbols: string[];

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

export type SignalAction = "buy" | "sell" | "hold";
export type SignalStatus = "pending" | "executed" | "ignored";

export type ExternalSignal = {
  id: string;
  symbol: string;
  name: string;
  action: SignalAction;
  price: number;
  amountUsd?: number;
  amount?: number;
  takeProfit?: number;
  stopLoss?: number;
  confidence?: number;
  notes?: string;
  status: SignalStatus;
  createdAt: string;
  executedAt?: string;
};

export type BotPricePoint = {
  price: number;
  timestamp: string;
};

export type StrategyPosition = {
  amount: number;
  avgPrice: number;
  realizedPnl: number;
  tradesCount: number;
  lastBuyAt: string | null;
  lastSellAt: string | null;
};

export type BotState = {
  active: boolean;
  startedAt: string | null;
  lastActionBySymbol: Record<string, string>;
  lastActionByStrategySymbol: Record<string, string>;
  priceHistoryBySymbol: Record<string, BotPricePoint[]>;
  positionsByStrategy: Record<string, Record<string, StrategyPosition>>;
};

export type DB = {
  wallet: {
    balance: number;
    currency: "USD" | "BRL";
  };

  holdings: Holding[];
  trades: Trade[];
  signals: ExternalSignal[];

  history: {
    timestamp: string;
    label: string;
    value: number;
  }[];

  strategies: Strategy[];

  bot: BotState;
};
