export interface CoinBalance {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  change24h: number;
  price: number;
  icon: string;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
  pnl?: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  pair: string;
  active: boolean;
  stopLoss: number;
  takeProfit: number;
  type: 'grid' | 'dca' | 'scalping' | 'momentum';
  pnl: number;
  tradesCount: number;
}

// ❌ REMOVE DADOS FAKE
export const coins: CoinBalance[] = [];

// ❌ REMOVE TOTAL FIXO
export const totalBalance = 0;

// ❌ REMOVE TRADES FAKE
export const recentTrades: Trade[] = [];

// ❌ REMOVE ESTRATÉGIAS FAKE (opcional manter se quiser UI)
export const strategies: Strategy[] = [
  {
    id: '1',
    name: 'Bot Automático',
    description: 'Compra queda e vende alta',
    pair: 'MULTI',
    active: true,
    stopLoss: 5,
    takeProfit: 3,
    type: 'momentum',
    pnl: 0,
    tradesCount: 0,
  },
];

// 🔥 MANTÉM GRÁFICO (só visual)
export const performanceData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }),
  portfolio: 0, // 🔥 sem fake
  btc: 0,
}));

// 🔥 BOT STATUS (controlado pelo DB depois)
export const botStatus = {
  active: false,
  uptime: '0h',
  activeStrategies: 1,
  totalTrades24h: 0,
  profit24h: 0,
  profitTotal: 0,
};