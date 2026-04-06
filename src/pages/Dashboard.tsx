import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Activity, Bot, Power } from "lucide-react";
import { totalBalance, botStatus, recentTrades, performanceData, coins } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [botActive, setBotActive] = useState(botStatus.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral do seu portfólio</p>
        </div>
        <Button
          onClick={() => setBotActive(!botActive)}
          variant={botActive ? "default" : "outline"}
          className={botActive ? "glow-primary" : ""}
        >
          <Power className="mr-2 h-4 w-4" />
          {botActive ? "Bot Ativo" : "Bot Inativo"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Saldo Total" value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} change="+4.32% (24h)" changeType="profit" icon={Wallet} />
        <StatCard title="Lucro 24h" value={`+$${botStatus.profit24h.toFixed(2)}`} change={`${botStatus.totalTrades24h} trades`} changeType="profit" icon={TrendingUp} />
        <StatCard title="Lucro Total" value={`+$${botStatus.profitTotal.toFixed(2)}`} change="Desde o início" changeType="profit" icon={Activity} />
        <StatCard title="Estratégias Ativas" value={String(botStatus.activeStrategies)} change={`Uptime: ${botStatus.uptime}`} changeType="neutral" icon={Bot} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 15%, 18%)', borderRadius: '8px', fontSize: 12 }}
                  labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
                  formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Portfólio']}
                />
                <Area type="monotone" dataKey="portfolio" stroke="hsl(155, 100%, 50%)" strokeWidth={2} fill="url(#colorPortfolio)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo por Moeda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coins.slice(0, 5).map((coin) => (
              <motion.div
                key={coin.symbol}
                className="flex items-center justify-between py-1.5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{coin.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground font-mono">{coin.balance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">${coin.valueUSD.toLocaleString()}</p>
                  <p className={`text-xs font-mono ${coin.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-2 font-medium">Par</th>
                  <th className="text-left py-2 font-medium">Tipo</th>
                  <th className="text-right py-2 font-medium">Preço</th>
                  <th className="text-right py-2 font-medium">Qtd</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  <th className="text-right py-2 font-medium">P&L</th>
                  <th className="text-right py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.slice(0, 5).map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 font-medium font-mono">{trade.pair}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={`text-xs ${trade.type === 'buy' ? 'border-profit text-profit' : 'border-loss text-loss'}`}>
                        {trade.type === 'buy' ? 'Compra' : 'Venda'}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono">${trade.price.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono">{trade.amount}</td>
                    <td className="py-2.5 text-right font-mono">${trade.total.toLocaleString()}</td>
                    <td className={`py-2.5 text-right font-mono ${trade.pnl && trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge variant="secondary" className="text-xs">
                        {trade.status === 'completed' ? '✓' : trade.status === 'pending' ? '⏳' : '✗'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
