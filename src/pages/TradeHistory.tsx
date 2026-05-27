import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDB } from "@/lib/db";
import { formatMoney, getCurrency } from "@/lib/currency";
import { useState, useMemo, useEffect } from "react";
import { Search, Filter } from "lucide-react";

type TradeItem = {
  id: number | string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  total: number;
  date: string;
  status?: "completed" | "pending" | "cancelled";
  pnl?: number;
};

export default function TradeHistory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [currency, setCurrency] = useState<"USD" | "BRL">("USD");

  useEffect(() => {
    const db = getDB();
    const storedTrades = Array.isArray(db?.trades) ? db.trades : [];
    setTrades(storedTrades);
    setCurrency(getCurrency(db));
  }, []);

  const normalizedTrades = useMemo(() => {
    return trades.map((trade) => ({
      ...trade,
      pair: `${trade.symbol}/USDT`,
      timestamp: new Date(trade.date),
      status: trade.status || "completed",
      pnl: typeof trade.pnl === "number" ? trade.pnl : undefined,
    }));
  }, [trades]);

  const totalPnl = normalizedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  const pnlTrades = normalizedTrades.filter((t) => typeof t.pnl === "number");
  const profitableTrades = pnlTrades.filter((t) => (t.pnl || 0) > 0).length;
  const winRate =
    pnlTrades.length > 0 ? (profitableTrades / pnlTrades.length) * 100 : 0;

  const filtered = useMemo(() => {
    return normalizedTrades.filter((t) => {
      if (search && !t.pair.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [normalizedTrades, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Histórico</h1>
        <p className="text-muted-foreground text-sm">
          Todas as operações realizadas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total de Trades</p>
            <p className="text-2xl font-bold font-display">
              {normalizedTrades.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Lucro / Prejuízo</p>
            <p
              className={`text-2xl font-bold font-mono ${
                totalPnl >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {totalPnl >= 0 ? "+" : ""}{formatMoney(totalPnl, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold font-mono text-profit">
              {winRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar par..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="buy">Compra</SelectItem>
            <SelectItem value="sell">Venda</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="completed">Completo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Par</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-right p-4 font-medium">Preço</th>
                  <th className="text-right p-4 font-medium">Qtd</th>
                  <th className="text-right p-4 font-medium">Total</th>
                  <th className="text-right p-4 font-medium">P&L</th>
                  <th className="text-right p-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((trade) => (
                    <tr
                      key={trade.id}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    >
                      <td className="p-4 text-muted-foreground text-xs">
                        {trade.timestamp.toLocaleString("pt-BR")}
                      </td>

                      <td className="p-4 font-medium font-mono">
                        {trade.pair}
                      </td>

                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            trade.type === "buy"
                              ? "border-profit text-profit"
                              : "border-loss text-loss"
                          }`}
                        >
                          {trade.type === "buy" ? "Compra" : "Venda"}
                        </Badge>
                      </td>

                      <td className="p-4 text-right font-mono">
                        {formatMoney(trade.price, currency)}
                      </td>

                      <td className="p-4 text-right font-mono">
                        {trade.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 8,
                        })}
                      </td>

                      <td className="p-4 text-right font-mono">
                        {formatMoney(trade.total, currency)}
                      </td>

                      <td
                        className={`p-4 text-right font-mono ${
                          typeof trade.pnl === "number"
                            ? trade.pnl >= 0
                              ? "text-profit"
                              : "text-loss"
                            : "text-muted-foreground"
                        }`}
                      >
                        {typeof trade.pnl === "number"
                          ? `${trade.pnl >= 0 ? "+" : ""}${formatMoney(
                              trade.pnl,
                              currency
                            )}`
                          : "—"}
                      </td>

                      <td className="p-4 text-right">
                        <Badge variant="secondary" className="text-xs">
                          {trade.status === "completed"
                            ? "Completo"
                            : trade.status === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhuma operação encontrada.
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
