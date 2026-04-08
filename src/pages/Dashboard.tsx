import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Activity, Bot, Power, RefreshCw } from "lucide-react";
import { botStatus, performanceData } from "@/lib/mock-data";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDB, saveDB } from "@/lib/db";
import { runBot } from "@/lib/bot";
import { updatePortfolioHistory } from "@/lib/chart";

export default function Dashboard() {
  const { prices, loading, lastUpdated, refetch } = useCryptoPrices();

  const [dbData, setDbData] = useState<any>(null);
  const [botActive, setBotActive] = useState(botStatus.active);

  // 🔥 carregar banco
  useEffect(() => {
    const load = () => {
      const db = getDB();
      setDbData(db);

      if (db?.bot?.active !== undefined) {
        setBotActive(db.bot.active);
      }
    };

    load();

    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 BOT LOOP (IA rodando)
  useEffect(() => {
    if (!botActive) return;

    const interval = setInterval(() => {
      runBot(prices);
      updatePortfolioHistory(prices);
    }, 5000);

    return () => clearInterval(interval);
  }, [botActive, prices]);

  const toggleBot = () => {
    const newState = !botActive;
    setBotActive(newState);

    const db = getDB();
    db.bot = { active: newState };
    saveDB(db);
  };

  const holdings = dbData?.holdings || [];
  const balance = dbData?.wallet?.balance || 0;
  const trades = dbData?.trades || [];

  const enrichedHoldings = holdings.map((h: any) => {
    const live = prices[h.symbol];
    const price = live?.price || h.avgPrice;
    const valueUSD = h.amount * price;
    const pnl = (price - h.avgPrice) * h.amount;

    return {
      ...h,
      price,
      valueUSD,
      pnl,
      change24h: live?.change24h || 0,
    };
  });

  const portfolioValue = enrichedHoldings.reduce((sum: number, c: any) => sum + c.valueUSD, 0);
  const totalBalance = balance + portfolioValue;

  const totalPnl = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">Visão geral do seu portfólio</p>

            {lastUpdated && (
              <span className="text-xs text-muted-foreground/60">
                · Atualizado {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            )}

            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={refetch}>
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* BOT */}
        <Button
          onClick={toggleBot}
          variant={botActive ? "default" : "outline"}
          className={botActive ? "glow-primary" : ""}
        >
          <Power className="mr-2 h-4 w-4" />
          {botActive ? "Bot Ativo" : "Bot Inativo"}
        </Button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Total"
          value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change="Dinheiro + ativos"
          changeType="neutral"
          icon={Wallet}
        />

        <StatCard
          title="Saldo em Caixa"
          value={`$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change="Disponível"
          changeType="neutral"
          icon={Activity}
        />

        <StatCard
          title="Lucro Total"
          value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
          change="Trades realizados"
          changeType={totalPnl >= 0 ? "profit" : "loss"}
          icon={TrendingUp}
        />

        <StatCard
          title="Estratégias Ativas"
          value={String(botStatus.activeStrategies)}
          change={`Uptime: ${botStatus.uptime}`}
          changeType="neutral"
          icon={Bot}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRÁFICO */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Performance (30d)
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={(dbData?.history || []).map((h: any) => ({
                date: h.date,
                portfolio: h.value,
              }))}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="hsl(155, 100%, 50%)"
                  strokeWidth={2}
                  fill="url(#colorPortfolio)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CARTEIRA */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carteira
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {enrichedHoldings.length > 0 ? (
              enrichedHoldings.map((coin: any) => (
                <motion.div key={coin.symbol} className="flex justify-between">
                  <span>{coin.symbol}</span>
                  <span>${coin.valueUSD.toFixed(2)}</span>
                </motion.div>
              ))
            ) : (
              <p>Nenhum ativo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* TRADES */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trades Recentes
          </CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2">Par</th>
                <th className="text-left py-2">Tipo</th>
                <th className="text-right py-2">Preço</th>
                <th className="text-right py-2">Qtd</th>
                <th className="text-right py-2">Total</th>
                <th className="text-right py-2">P&L</th>
              </tr>
            </thead>

            <tbody>
              {trades.slice(0, 5).map((t: any) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="py-2 font-mono">{t.symbol}/USDT</td>

                  <td>
                    <Badge
                      variant="outline"
                      className={
                        t.type === "buy"
                          ? "text-profit border-profit"
                          : "text-loss border-loss"
                      }
                    >
                      {t.type === "buy" ? "Compra" : "Venda"}
                    </Badge>
                  </td>

                  <td className="text-right">${t.price}</td>
                  <td className="text-right">{t.amount}</td>
                  <td className="text-right">${t.total}</td>

                  <td
                    className={`text-right ${t.pnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                  >
                    {t.pnl !== undefined
                      ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}