import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { strategies as initialStrategies, Strategy } from "@/lib/mock-data";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Brain, Target, ShieldAlert } from "lucide-react";

const typeLabels: Record<string, string> = {
  grid: 'Grid', dca: 'DCA', scalping: 'Scalping', momentum: 'Momentum',
};
const typeColors: Record<string, string> = {
  grid: 'border-primary text-primary', dca: 'border-warning text-warning',
  scalping: 'border-profit text-profit', momentum: 'border-purple-400 text-purple-400',
};

export default function Strategies() {
  const [strats, setStrats] = useState<Strategy[]>(initialStrategies);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleStrategy = (id: string) => {
    setStrats(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Estratégias</h1>
          <p className="text-muted-foreground text-sm">Configure suas estratégias de trading</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Estratégia</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Estratégia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
                <Input placeholder="Ex: BTC Grid Bot" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tipo</label>
                <Select>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid Trading</SelectItem>
                    <SelectItem value="dca">DCA</SelectItem>
                    <SelectItem value="scalping">Scalping</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Par</label>
                <Input placeholder="Ex: BTC/USDT" className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Stop Loss (%)</label>
                  <Input type="number" placeholder="5" className="bg-secondary border-border font-mono" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Take Profit (%)</label>
                  <Input type="number" placeholder="10" className="bg-secondary border-border font-mono" />
                </div>
              </div>
              <Button className="w-full" onClick={() => setDialogOpen(false)}>Criar Estratégia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strats.map((strat, i) => (
          <motion.div
            key={strat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-card border-border hover:border-primary/20 transition-colors ${strat.active ? '' : 'opacity-60'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{strat.name}</h3>
                      <p className="text-xs text-muted-foreground">{strat.description}</p>
                    </div>
                  </div>
                  <Switch checked={strat.active} onCheckedChange={() => toggleStrategy(strat.id)} />
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge variant="outline" className={typeColors[strat.type]}>{typeLabels[strat.type]}</Badge>
                  <Badge variant="secondary" className="font-mono text-xs">{strat.pair}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ShieldAlert className="h-3 w-3" />SL</p>
                    <p className="text-sm font-mono text-loss">{strat.stopLoss}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Target className="h-3 w-3" />TP</p>
                    <p className="text-sm font-mono text-profit">{strat.takeProfit}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="text-sm font-mono">{strat.tradesCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <p className={`text-sm font-mono ${strat.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {strat.pnl >= 0 ? '+' : ''}${strat.pnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
