import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { getDB, saveDB } from "@/lib/db";
import { convertToUsd, formatMoney, getCurrency } from "@/lib/currency";
import { executeTrade } from "@/lib/trading";
import type { ExternalSignal, SignalAction } from "@/types/db";
import { CheckCircle2, Clock, ClipboardList, Play, XCircle } from "lucide-react";
import { toast } from "sonner";

const COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
];

function getSignalStatus(signal: ExternalSignal) {
  if (signal.status === "executed") {
    return { label: "Executado", icon: CheckCircle2, className: "text-profit border-profit" };
  }

  if (signal.status === "ignored") {
    return { label: "Ignorado", icon: XCircle, className: "text-muted-foreground border-border" };
  }

  return { label: "Pendente", icon: Clock, className: "text-primary border-primary" };
}

export default function Analysis() {
  const { prices, loading } = useCryptoPrices();
  const [signals, setSignals] = useState<ExternalSignal[]>(() => getDB().signals || []);
  const [currency, setCurrency] = useState<"USD" | "BRL">(() =>
    getCurrency(getDB())
  );
  const [symbol, setSymbol] = useState("BTC");
  const [action, setAction] = useState<SignalAction>("buy");
  const [amountUsd, setAmountUsd] = useState("100");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [confidence, setConfidence] = useState("");
  const [notes, setNotes] = useState("");

  const selectedCoin = COINS.find((coin) => coin.symbol === symbol) || COINS[0];
  const currentPrice = prices[symbol]?.price || 0;

  const pendingCount = useMemo(
    () => signals.filter((signal) => signal.status === "pending").length,
    [signals]
  );

  const reloadSignals = () => {
    const db = getDB();
    setSignals([...(db.signals || [])]);
    setCurrency(getCurrency(db));
  };

  const saveSignal = () => {
    const price = Number(currentPrice);

    if (!price) {
      toast.error("Preco ainda nao disponivel para esse ativo");
      return;
    }

    const signal: ExternalSignal = {
      id: `signal_${Date.now()}`,
      symbol,
      name: selectedCoin.name,
      action,
      price,
      amountUsd:
        Number(amountUsd) > 0 ? convertToUsd(Number(amountUsd), currency) : undefined,
      takeProfit: Number(takeProfit) > 0 ? Number(takeProfit) : undefined,
      stopLoss: Number(stopLoss) > 0 ? Number(stopLoss) : undefined,
      confidence: Number(confidence) > 0 ? Number(confidence) : undefined,
      notes: notes.trim() || undefined,
      status: action === "hold" ? "ignored" : "pending",
      createdAt: new Date().toISOString(),
    };

    const db = getDB();
    db.signals = [signal, ...(db.signals || [])];
    saveDB(db);

    setNotes("");
    setTakeProfit("");
    setStopLoss("");
    setConfidence("");
    reloadSignals();
    toast.success("Sinal salvo no JSON");
  };

  const executeSignal = (signal: ExternalSignal) => {
    try {
      if (signal.status !== "pending") return;

      const livePrice = prices[signal.symbol]?.price || signal.price;
      const db = getDB();
      const holding = db.holdings.find((item) => item.symbol === signal.symbol);

      const amount =
        signal.action === "buy"
          ? (signal.amountUsd || 0) / livePrice
          : signal.amount || holding?.amount || 0;

      if (!amount || amount <= 0) {
        toast.error("Quantidade invalida para executar o sinal");
        return;
      }

      executeTrade({
        symbol: signal.symbol,
        name: signal.name,
        type: signal.action,
        price: livePrice,
        amount,
        source: signal.id,
      });

      const updated = getDB();
      const storedSignal = updated.signals.find((item) => item.id === signal.id);

      if (storedSignal) {
        storedSignal.status = "executed";
        storedSignal.executedAt = new Date().toISOString();
      }

      saveDB(updated);
      reloadSignals();
      toast.success("Sinal executado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao executar sinal");
    }
  };

  const ignoreSignal = (signalId: string) => {
    const db = getDB();
    const signal = db.signals.find((item) => item.id === signalId);

    if (!signal) return;

    signal.status = "ignored";
    saveDB(db);
    reloadSignals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Sinais Externos</h1>
          <p className="text-muted-foreground text-sm">
            Registre a estrategia recebida de terceiros e execute quando fizer sentido.
          </p>
        </div>

        <Badge variant="outline" className="w-fit border-primary text-primary">
          {pendingCount} pendente{pendingCount === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novo sinal
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ativo</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COINS.map((coin) => (
                      <SelectItem key={coin.symbol} value={coin.symbol}>
                        {coin.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Acao</Label>
                <Select value={action} onValueChange={(value) => setAction(value as SignalAction)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Comprar</SelectItem>
                    <SelectItem value="sell">Vender</SelectItem>
                    <SelectItem value="hold">Aguardar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preco atual</Label>
                <Input value={currentPrice ? formatMoney(currentPrice, currency) : "Carregando"} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Valor da ordem</Label>
                <Input
                  type="number"
                  min="0"
                  value={amountUsd}
                  onChange={(event) => setAmountUsd(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>TP %</Label>
                <Input
                  type="number"
                  min="0"
                  value={takeProfit}
                  onChange={(event) => setTakeProfit(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>SL %</Label>
                <Input
                  type="number"
                  min="0"
                  value={stopLoss}
                  onChange={(event) => setStopLoss(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Conf. %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(event) => setConfidence(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Cole aqui a estrategia, justificativa ou regra recebida."
              />
            </div>

            <Button className="w-full" onClick={saveSignal} disabled={loading && !currentPrice}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Salvar sinal
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sinais salvos no JSON
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {signals.length > 0 ? (
              signals.map((signal) => {
                const status = getSignalStatus(signal);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={signal.id}
                    className="rounded-md border border-border p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">{signal.symbol}/USDT</p>
                          <Badge
                            variant="outline"
                            className={
                              signal.action === "buy"
                                ? "border-profit text-profit"
                                : signal.action === "sell"
                                  ? "border-loss text-loss"
                                  : "border-border text-muted-foreground"
                            }
                          >
                            {signal.action === "buy"
                              ? "Compra"
                              : signal.action === "sell"
                                ? "Venda"
                                : "Aguardar"}
                          </Badge>
                          <Badge variant="outline" className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(signal.createdAt).toLocaleString("pt-BR")} em{" "}
                          {formatMoney(signal.price, currency)}
                        </p>
                      </div>

                      {signal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => executeSignal(signal)}>
                            <Play className="mr-2 h-4 w-4" />
                            Executar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => ignoreSignal(signal.id)}
                          >
                            Ignorar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p>{signal.amountUsd ? formatMoney(signal.amountUsd, currency) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">TP</p>
                        <p>{signal.takeProfit ? `${signal.takeProfit}%` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SL</p>
                        <p>{signal.stopLoss ? `${signal.stopLoss}%` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confianca</p>
                        <p>{signal.confidence ? `${signal.confidence}%` : "-"}</p>
                      </div>
                    </div>

                    {signal.notes && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {signal.notes}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum sinal cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
