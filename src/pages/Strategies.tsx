import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileJson, Plus, Trash2, Zap } from "lucide-react";
import { getDB } from "@/lib/db";
import { formatMoney, getCurrency } from "@/lib/currency";
import {
  createStrategy,
  deleteStrategy,
  importOpenClawStrategies,
  toggleStrategy,
  updateStrategy,
} from "@/lib/settings";
import type { Strategy } from "@/types/db";
import { toast } from "sonner";

const COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "SOL", name: "Solana" },
];

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [openClawJson, setOpenClawJson] = useState("");
  const [currency, setCurrency] = useState<"USD" | "BRL">("USD");

  const load = () => {
    const db = getDB();
    setStrategies([...db.strategies]);
    setCurrency(getCurrency(db));
  };

  useEffect(() => {
    load();
  }, []);

  const getStats = (strategyId: string) => {
    const db = getDB();
    const trades = db.trades.filter((trade) => trade.source === strategyId);
    const pnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

    return {
      trades: trades.length,
      pnl,
    };
  };

  const toggleSymbol = (strategy: Strategy, symbol: string) => {
    const selected = strategy.symbols || [];
    const nextSymbols = selected.includes(symbol)
      ? selected.filter((item) => item !== symbol)
      : [...selected, symbol];

    if (nextSymbols.length === 0) return;

    updateStrategy(strategy.id, { symbols: nextSymbols });
    load();
  };

  const handleOpenClawImport = () => {
    try {
      const imported = importOpenClawStrategies(openClawJson);

      setOpenClawJson("");
      setImportDialogOpen(false);
      load();
      toast.success(`${imported.length} estrategia(s) importada(s)`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "JSON do OpenClaw invalido"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Estrategias</h1>
          <p className="text-muted-foreground text-sm">
            Configure estrategias para moedas especificas.
          </p>
        </div>

        <div className="flex gap-2">
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileJson className="mr-2 h-4 w-4" />
              Importar OpenClaw
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importar estrategias do OpenClaw</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Textarea
                className="min-h-72 font-mono text-xs"
                placeholder='Cole aqui o JSON do OpenClaw. Exemplo: {"strategies":[{"name":"Demo","symbols":["BTC"],"active":true,"risk":0.1,"minChange":0,"takeProfit":0.1,"stopLoss":0.1,"maxAllocationPerCoin":0.3,"minTradeValue":10}]}'
                value={openClawJson}
                onChange={(event) => setOpenClawJson(event.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleOpenClawImport}
                  disabled={!openClawJson.trim()}
                >
                  Importar estrategias
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenClawJson("")}
                  disabled={!openClawJson.trim()}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova estrategia
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar estrategia</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Input
                placeholder="Nome da estrategia"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />

              <Button
                className="w-full"
                onClick={() => {
                  if (!newName.trim()) return;

                  const created = createStrategy(newName);

                  setNewName("");
                  setDialogOpen(false);
                  setStrategies((prev) => [...prev, created]);
                }}
              >
                Criar estrategia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy, index) => {
          const stats = getStats(strategy.id);
          const selectedSymbols = strategy.symbols || ["BTC"];

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`bg-card border-border ${
                  strategy.active ? "" : "opacity-60"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Zap className="h-5 w-5 text-primary shrink-0" />
                      <Input
                        value={strategy.name}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            name: event.target.value,
                          });
                          load();
                        }}
                        className="h-8"
                      />
                    </div>

                    <Switch
                      checked={strategy.active}
                      onCheckedChange={() => {
                        toggleStrategy(strategy.id);
                        load();
                      }}
                    />

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        const deleted = deleteStrategy(strategy.id);
                        load();
                        if (deleted) {
                          toast.success("Estrategia apagada");
                        } else {
                          toast.error("Nao foi possivel apagar esta estrategia");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Moedas desta estrategia
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {COINS.map((coin) => (
                        <label
                          key={coin.symbol}
                          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={selectedSymbols.includes(coin.symbol)}
                            onCheckedChange={() =>
                              toggleSymbol(strategy, coin.symbol)
                            }
                          />
                          <span className="font-mono">{coin.symbol}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1">Risco</p>
                      <Input
                        type="number"
                        value={strategy.risk}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            risk: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        % do saldo por trade
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">Min Change</p>
                      <Input
                        type="number"
                        value={strategy.minChange}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            minChange: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        variacao minima (%)
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">TP</p>
                      <Input
                        type="number"
                        value={strategy.takeProfit}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            takeProfit: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        lucro alvo (%)
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">SL</p>
                      <Input
                        type="number"
                        value={strategy.stopLoss}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            stopLoss: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        limite de perda (%)
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">Max Allocation</p>
                      <Input
                        type="number"
                        value={strategy.maxAllocationPerCoin}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            maxAllocationPerCoin: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        % maximo por moeda
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">Min Trade</p>
                      <Input
                        type="number"
                        value={strategy.minTradeValue}
                        onChange={(event) => {
                          updateStrategy(strategy.id, {
                            minTradeValue: Number(event.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        valor minimo por trade
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Moedas</p>
                      <p>{selectedSymbols.length}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">SL</p>
                      <p className="text-red-500">{strategy.stopLoss}%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">TP</p>
                      <p className="text-green-500">{strategy.takeProfit}%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Trades</p>
                      <p>{stats.trades}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">P&L</p>
                      <p
                        className={
                          stats.pnl >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {formatMoney(stats.pnl, currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
