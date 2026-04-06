import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coins } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [amount, setAmount] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    coins.forEach(c => { initial[c.symbol] = c.price; });
    setPrices(initial);

    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        coins.forEach(c => {
          const change = (Math.random() - 0.5) * c.price * 0.002;
          next[c.symbol] = (prev[c.symbol] || c.price) + change;
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = prices[selectedCoin.symbol] || selectedCoin.price;
  const total = parseFloat(amount || "0") * currentPrice;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Trading</h1>
        <p className="text-muted-foreground text-sm">Compra e venda manual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moedas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
            {coins.map((coin) => {
              const livePrice = prices[coin.symbol] || coin.price;
              const priceDiff = livePrice - coin.price;
              const pctChange = (priceDiff / coin.price) * 100;

              return (
                <motion.button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedCoin.symbol === coin.symbol ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent/50'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{coin.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{coin.symbol}</p>
                      <p className="text-xs text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-mono flex items-center justify-end gap-0.5 ${pctChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {pctChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(pctChange).toFixed(2)}%
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCoin.icon}</span>
                <div>
                  <CardTitle className="text-lg">{selectedCoin.symbol}/USDT</CardTitle>
                  <p className="text-2xl font-bold font-mono text-primary">
                    ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${selectedCoin.change24h >= 0 ? 'border-profit text-profit' : 'border-loss text-loss'}`}>
                {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h}% (24h)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="buy" className="data-[state=active]:bg-profit data-[state=active]:text-primary-foreground">Comprar</TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-loss data-[state=active]:text-primary-foreground">Vender</TabsTrigger>
              </TabsList>

              {(['buy', 'sell'] as const).map((type) => (
                <TabsContent key={type} value={type} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Preço (USDT)</label>
                    <Input
                      value={currentPrice.toFixed(2)}
                      readOnly
                      className="font-mono bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Quantidade ({selectedCoin.symbol})</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-mono bg-secondary border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setAmount(((selectedCoin.balance * pct) / 100).toFixed(4))}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                  <div className="bg-secondary rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-mono">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa</span>
                      <span className="font-mono">0.1%</span>
                    </div>
                  </div>
                  <Button
                    className={`w-full font-medium ${type === 'buy' ? 'bg-profit hover:bg-profit/90' : 'bg-loss hover:bg-loss/90'} text-primary-foreground`}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    {type === 'buy' ? 'Comprar' : 'Vender'} {selectedCoin.symbol}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
