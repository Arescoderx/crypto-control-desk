import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Activity, Bot, Power, RefreshCw } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getDB, saveDB } from "@/lib/db";
import { runBot } from "@/lib/bot";
import { updatePortfolioHistory } from "@/lib/chart";
import { formatMoney, getCurrency } from "@/lib/currency";

function formatBotUptime(startedAt: string | null) {
  if (!startedAt) return "0m";

  const diffMs = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function Dashboard() {
  const { prices, loading, lastUpdated, refetch } = useCryptoPrices();
  const [dbData, setDbData] = useState<any>(getDB());

  useEffect(() => {
    const load = () => setDbData(getDB());

    load();

    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!prices || Object.keys(prices).length === 0) return;

    updatePortfolioHistory(prices);
  }, [prices]);

  const toggleBot = () => {
    const db = getDB();
    const nextActive = !db.bot.active;

    db.bot.active = nextActive;
    db.bot.startedAt = nextActive ? new Date().toISOString() : null;

    saveDB(db);
    setDbData(db);
  };

  const holdings = dbData?.holdings || [];
  const balance = dbData?.wallet?.balance || 0;
  const trades = dbData?.trades || [];
  const history = dbData?.history || [];
  const currency = getCurrency(dbData);

  const enrichedHoldings = useMemo(() => {
    return holdings.map((h: any) => {
      const live = prices[h.symbol];
      const currentPrice = live?.price || h.avgPrice || 0;
      const valueUSD = h.amount * currentPrice;
      const pnl = (currentPrice - h.avgPrice) * h.amount;

      return {
        ...h,
        currentPrice,
        valueUSD,
        pnl,
        change24h: live?.change24h || 0,
      };
    });
  }, [holdings, prices]);

  const portfolioValue = enrichedHoldings.reduce(
    (sum: number, item: any) => sum + item.valueUSD,
    0
  );

  const totalBalance = balance + portfolioValue;

  const realizedPnl = trades.reduce(
    (sum: number, trade: any) => sum + (trade.pnl || 0),
    0
  );

  const unrealizedPnl = enrichedHoldings.reduce(
    (sum: number, item: any) => sum + (item.pnl || 0),
    0
  );

  const totalPnl = realizedPnl + unrealizedPnl;

  const botActive = dbData?.bot?.active || false;
  const db = getDB();
  const activeStrategies = db.strategies.filter((s) => s.active).length;
  const uptime = formatBotUptime(dbData?.bot?.startedAt || null);

  return (
    <div className="space-y-6">
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

        <Button
          onClick={toggleBot}
          variant={botActive ? "default" : "outline"}
          className={botActive ? "glow-primary" : ""}
        >
          <Power className="mr-2 h-4 w-4" />
          {botActive ? "Bot Ativo" : "Bot Inativo"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Total"
          value={formatMoney(totalBalance, currency)}
          change="Dinheiro + ativos"
          changeType="neutral"
          icon={Wallet}
        />

        <StatCard
          title="Saldo em Caixa"
          value={formatMoney(balance, currency)}
          change="Disponível"
          changeType="neutral"
          icon={Activity}
        />

        <StatCard
          title="Lucro Total"
          value={`${totalPnl >= 0 ? "+" : ""}${formatMoney(totalPnl, currency)}`}
          change="Realizado + em aberto"
          changeType={totalPnl >= 0 ? "profit" : "loss"}
          icon={TrendingUp}
        />

        <StatCard
          title="Estratégias Ativas"
          value={String(activeStrategies)}
          change={`Uptime: ${uptime}`}
          changeType="neutral"
          icon={Bot}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Performance do Portfólio
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={history.map((h: any) => ({
                  date: h.label,
                  portfolio: h.value,
                }))}
              >
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => formatMoney(Number(value), currency)} />

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

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carteira
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {enrichedHoldings.length > 0 ? (
              enrichedHoldings.map((coin: any) => (
                <motion.div
                  key={coin.symbol}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p className="font-medium">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {coin.amount.toFixed(6)} @ {formatMoney(coin.avgPrice, currency)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{formatMoney(coin.valueUSD, currency)}</p>
                    <p className={`text-xs ${coin.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {coin.pnl >= 0 ? "+" : ""}
                      {formatMoney(coin.pnl, currency)}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum ativo na carteira</p>
            )}
          </CardContent>
        </Card>
      </div>

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
                <th className="text-right py-2">P&amp;L</th>
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

                  <td className="text-right">{formatMoney(t.price, currency)}</td>
                  <td className="text-right">{Number(t.amount).toFixed(6)}</td>
                  <td className="text-right">{formatMoney(t.total, currency)}</td>

                  <td
                    className={`text-right ${t.pnl === undefined
                      ? "text-muted-foreground"
                      : t.pnl >= 0
                        ? "text-profit"
                        : "text-loss"
                      }`}
                  >
                    {t.pnl !== undefined
                      ? `${t.pnl >= 0 ? "+" : ""}${formatMoney(t.pnl, currency)}`
                      : "—"}
                  </td>
                </tr>
              ))}

              {trades.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum trade realizado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
