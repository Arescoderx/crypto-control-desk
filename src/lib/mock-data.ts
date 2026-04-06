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

export const coins: CoinBalance[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5423, valueUSD: 35245.12, change24h: 2.34, price: 65000.50, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: 4.231, valueUSD: 10577.50, change24h: -1.12, price: 2500.59, icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', balance: 85.42, valueUSD: 12813.00, change24h: 5.67, price: 150.00, icon: '◎' },
  { symbol: 'BNB', name: 'BNB', balance: 12.5, valueUSD: 7500.00, change24h: 0.89, price: 600.00, icon: '◆' },
  { symbol: 'ADA', name: 'Cardano', balance: 15000, valueUSD: 6750.00, change24h: -2.45, price: 0.45, icon: '₳' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 50000, valueUSD: 5000.00, change24h: 8.12, price: 0.10, icon: 'Ð' },
];

export const totalBalance = coins.reduce((sum, c) => sum + c.valueUSD, 0);

export const recentTrades: Trade[] = [
  { id: '1', pair: 'BTC/USDT', type: 'buy', price: 64800, amount: 0.05, total: 3240, timestamp: new Date(Date.now() - 300000), status: 'completed', pnl: 45.20 },
  { id: '2', pair: 'ETH/USDT', type: 'sell', price: 2520, amount: 1.2, total: 3024, timestamp: new Date(Date.now() - 900000), status: 'completed', pnl: -12.50 },
  { id: '3', pair: 'SOL/USDT', type: 'buy', price: 148.50, amount: 10, total: 1485, timestamp: new Date(Date.now() - 1800000), status: 'completed', pnl: 85.00 },
  { id: '4', pair: 'BNB/USDT', type: 'sell', price: 605, amount: 2, total: 1210, timestamp: new Date(Date.now() - 3600000), status: 'completed', pnl: 32.40 },
  { id: '5', pair: 'ADA/USDT', type: 'buy', price: 0.44, amount: 5000, total: 2200, timestamp: new Date(Date.now() - 7200000), status: 'pending' },
  { id: '6', pair: 'DOGE/USDT', type: 'buy', price: 0.098, amount: 10000, total: 980, timestamp: new Date(Date.now() - 10800000), status: 'completed', pnl: 120.00 },
  { id: '7', pair: 'BTC/USDT', type: 'sell', price: 63500, amount: 0.1, total: 6350, timestamp: new Date(Date.now() - 14400000), status: 'completed', pnl: -250.00 },
  { id: '8', pair: 'ETH/USDT', type: 'buy', price: 2480, amount: 2.0, total: 4960, timestamp: new Date(Date.now() - 18000000), status: 'completed', pnl: 67.80 },
];

export const strategies: Strategy[] = [
  { id: '1', name: 'BTC Grid Bot', description: 'Grid trading entre $60k-$70k', pair: 'BTC/USDT', active: true, stopLoss: 5, takeProfit: 3, type: 'grid', pnl: 1234.56, tradesCount: 48 },
  { id: '2', name: 'ETH DCA', description: 'Dollar cost averaging semanal', pair: 'ETH/USDT', active: true, stopLoss: 10, takeProfit: 15, type: 'dca', pnl: 567.89, tradesCount: 12 },
  { id: '3', name: 'SOL Scalper', description: 'Scalping em timeframe de 5min', pair: 'SOL/USDT', active: false, stopLoss: 2, takeProfit: 1.5, type: 'scalping', pnl: -89.12, tradesCount: 156 },
  { id: '4', name: 'Momentum Multi', description: 'Momentum em múltiplos pares', pair: 'MULTI', active: true, stopLoss: 7, takeProfit: 10, type: 'momentum', pnl: 2345.67, tradesCount: 34 },
];

export const performanceData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  portfolio: 65000 + Math.random() * 15000 + i * 200,
  btc: 60000 + Math.random() * 8000,
}));

export const botStatus = {
  active: true,
  uptime: '12d 5h 32m',
  activeStrategies: 3,
  totalTrades24h: 27,
  profit24h: 342.56,
  profitTotal: 4148.12,
};
