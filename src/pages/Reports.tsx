import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Printer, RefreshCw } from "lucide-react";
import { getDB } from "@/lib/db";
import { formatMoney, getCurrency } from "@/lib/currency";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { prices } = useCryptoPrices();
  const [dbData, setDbData] = useState(() => getDB());
  const currency = getCurrency(dbData);

  const holdingsReport = useMemo(() => {
    return dbData.holdings.map((holding) => {
      const currentPrice = prices[holding.symbol]?.price || holding.avgPrice;
      const total = holding.amount * currentPrice;
      const pnl = (currentPrice - holding.avgPrice) * holding.amount;

      return {
        ...holding,
        currentPrice,
        total,
        pnl,
      };
    });
  }, [dbData.holdings, prices]);

  const trades = dbData.trades || [];
  const totalInvested = trades
    .filter((trade) => trade.type === "buy")
    .reduce((sum, trade) => sum + trade.total, 0);
  const totalSold = trades
    .filter((trade) => trade.type === "sell")
    .reduce((sum, trade) => sum + trade.total, 0);
  const realizedPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const holdingsValue = holdingsReport.reduce((sum, item) => sum + item.total, 0);
  const portfolioTotal = dbData.wallet.balance + holdingsValue;

  const tradeChartData = useMemo(() => {
    const bySymbol = trades.reduce<Record<string, { symbol: string; buys: number; sells: number }>>(
      (acc, trade) => {
        acc[trade.symbol] ||= { symbol: trade.symbol, buys: 0, sells: 0 };
        if (trade.type === "buy") acc[trade.symbol].buys += 1;
        if (trade.type === "sell") acc[trade.symbol].sells += 1;
        return acc;
      },
      {}
    );

    return Object.values(bySymbol);
  }, [trades]);

  const historyChartData = dbData.history.map((item) => ({
    date: item.label,
    value: item.value,
  }));

  const exportCsv = () => {
    const rows = [
      ["Data", "Ativo", "Tipo", "Preco", "Quantidade", "Total", "P&L", "Origem"],
      ...trades.map((trade) => [
        new Date(trade.date).toLocaleString("pt-BR"),
        trade.symbol,
        trade.type === "buy" ? "Compra" : "Venda",
        String(trade.price),
        String(trade.amount),
        String(trade.total),
        String(trade.pnl ?? ""),
        trade.source || "manual",
      ]),
    ];

    downloadText(
      "relatorio-trades.csv",
      rows.map((row) => row.join(";")).join("\n"),
      "text/csv;charset=utf-8;"
    );
  };

  return (
    <div className="space-y-6 print-report">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Relatorios</h1>
          <p className="text-muted-foreground text-sm">
            Visao para imprimir tabelas, graficos e resultados do simulador.
          </p>
        </div>

        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={() => setDbData(getDB())}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Patrimonio total</p>
            <p className="text-2xl font-bold font-mono">
              {formatMoney(portfolioTotal, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total comprado</p>
            <p className="text-2xl font-bold font-mono">
              {formatMoney(totalInvested, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total vendido</p>
            <p className="text-2xl font-bold font-mono">
              {formatMoney(totalSold, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">P&L realizado</p>
            <p
              className={`text-2xl font-bold font-mono ${
                realizedPnl >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {realizedPnl >= 0 ? "+" : ""}
              {formatMoney(realizedPnl, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Evolucao do portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={historyChartData}>
                <defs>
                  <linearGradient id="reportPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatMoney(Number(value), currency)} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(155, 100%, 50%)"
                  fill="url(#reportPortfolio)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trades por ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tradeChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="symbol" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="buys" name="Compras" fill="hsl(145, 70%, 50%)" />
                <Bar dataKey="sells" name="Vendas" fill="hsl(0, 72%, 55%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Carteira atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm report-table">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left p-3">Ativo</th>
                  <th className="text-right p-3">Quantidade</th>
                  <th className="text-right p-3">Preco medio</th>
                  <th className="text-right p-3">Preco atual</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-right p-3">P&L aberto</th>
                </tr>
              </thead>
              <tbody>
                {holdingsReport.map((item) => (
                  <tr key={item.symbol} className="border-b border-border/50">
                    <td className="p-3 font-mono">{item.symbol}</td>
                    <td className="p-3 text-right">{item.amount.toFixed(6)}</td>
                    <td className="p-3 text-right">{formatMoney(item.avgPrice, currency)}</td>
                    <td className="p-3 text-right">{formatMoney(item.currentPrice, currency)}</td>
                    <td className="p-3 text-right">{formatMoney(item.total, currency)}</td>
                    <td
                      className={`p-3 text-right ${
                        item.pnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {item.pnl >= 0 ? "+" : ""}
                      {formatMoney(item.pnl, currency)}
                    </td>
                  </tr>
                ))}

                {holdingsReport.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Nenhum ativo em carteira.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Historico de trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm report-table">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Ativo</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Preco</th>
                  <th className="text-right p-3">Qtd</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-right p-3">P&L</th>
                  <th className="text-right p-3">Origem</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50">
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(trade.date).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 font-mono">{trade.symbol}/USDT</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={
                          trade.type === "buy"
                            ? "border-profit text-profit"
                            : "border-loss text-loss"
                        }
                      >
                        {trade.type === "buy" ? "Compra" : "Venda"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{formatMoney(trade.price, currency)}</td>
                    <td className="p-3 text-right">{trade.amount.toFixed(6)}</td>
                    <td className="p-3 text-right">{formatMoney(trade.total, currency)}</td>
                    <td
                      className={`p-3 text-right ${
                        trade.pnl === undefined
                          ? "text-muted-foreground"
                          : trade.pnl >= 0
                            ? "text-profit"
                            : "text-loss"
                      }`}
                    >
                      {trade.pnl !== undefined
                        ? `${trade.pnl >= 0 ? "+" : ""}${formatMoney(
                            trade.pnl,
                            currency
                          )}`
                        : "-"}
                    </td>
                    <td className="p-3 text-right text-xs">{trade.source || "manual"}</td>
                  </tr>
                ))}

                {trades.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      Nenhum trade realizado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
