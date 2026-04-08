import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Brain } from "lucide-react";

import { getDB } from "@/lib/db";
import {
  createStrategy,
  toggleStrategy,
  updateStrategy,
} from "@/lib/settings";

import type { Strategy } from "@/types/db";

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const load = () => {
    setStrategies(getDB().strategies);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔥 CALCULAR P&L E TRADES
  const getStats = (strategyId: string) => {
    const db = getDB();

    const trades = db.trades.filter(
      (t) => t.source === strategyId
    );

    const pnl = trades.reduce((sum, t) => {
      return sum + (t.pnl || 0);
    }, 0);

    return {
      trades: trades.length,
      pnl,
    };
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">
            Estratégias
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure suas estratégias de trading
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Estratégia
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Estratégia</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Input
                placeholder="Nome da estratégia"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={() => {
                  createStrategy(newName);
                  setNewName("");
                  setDialogOpen(false);
                  load();
                }}
              >
                Criar Estratégia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((s, i) => {
          const stats = getStats(s.id);

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`bg-card border-border ${
                  s.active ? "" : "opacity-60"
                }`}
              >
                <CardContent className="p-5 space-y-4">

                  {/* HEADER */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <Input
                        value={s.name}
                        onChange={(e) => {
                          updateStrategy(s.id, {
                            name: e.target.value,
                          });
                          load();
                        }}
                        className="h-8"
                      />
                    </div>

                    <Switch
                      checked={s.active}
                      onCheckedChange={() => {
                        toggleStrategy(s.id);
                        load();
                      }}
                    />
                  </div>

                  {/* INPUTS COM LABEL */}
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs mb-1">💰 Risk</p>
                      <Input
                        type="number"
                        value={s.risk}
                        onChange={(e) => {
                          updateStrategy(s.id, {
                            risk: Number(e.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        % do saldo por trade
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">📉 Min Change</p>
                      <Input
                        type="number"
                        value={s.minChange}
                        onChange={(e) => {
                          updateStrategy(s.id, {
                            minChange: Number(e.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        variação mínima (%)
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">🟢 TP</p>
                      <Input
                        type="number"
                        value={s.takeProfit}
                        onChange={(e) => {
                          updateStrategy(s.id, {
                            takeProfit: Number(e.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        lucro alvo (%)
                      </p>
                    </div>

                    <div>
                      <p className="text-xs mb-1">🔴 SL</p>
                      <Input
                        type="number"
                        value={s.stopLoss}
                        onChange={(e) => {
                          updateStrategy(s.id, {
                            stopLoss: Number(e.target.value),
                          });
                          load();
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        limite de perda (%)
                      </p>
                    </div>

                  </div>

                  {/* STATS IGUAL BOT */}
                  <div className="flex justify-between pt-2 text-sm">

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">SL</p>
                      <p className="text-red-500">
                        {s.stopLoss}%
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">TP</p>
                      <p className="text-green-500">
                        {s.takeProfit}%
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        Trades
                      </p>
                      <p>{stats.trades}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        P&L
                      </p>
                      <p
                        className={
                          stats.pnl >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        ${stats.pnl.toFixed(2)}
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