import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coins } from "@/lib/mock-data";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export default function Trading() {
  const [selectedSymbol, setSelectedSymbol] = useState(coins[0].symbol);
  const [amount, setAmount] = useState("");
  const { prices, loading, lastUpdated, refetch } = useCryptoPrices();

  const selectedCoin = coins.find((c) => c.symbol === selectedSymbol) || coins[0];

  const enrichedCoins = coins.map((coin) => {
    const live = prices[coin.symbol];
    return {
      ...coin,
      price: live?.price ?? coin.price,
      change24h: live?.change24h ?? coin.change24h,
    };
  });

  const currentCoin = enrichedCoins.find((c) => c.symbol === selectedSymbol) || enrichedCoins[0];
  const currentPrice = currentCoin.price;
  const total = parseFloat(amount || "0") * currentPrice;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Trading</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">Compra e venda manual</p>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground/60">
                · Preços reais via CoinGecko
              </span>
            )}
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={refetch}>
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moedas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
            {enrichedCoins.map((coin) => (
              <motion.button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedSymbol === coin.symbol ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent/50'
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
                  <p className="text-sm font-mono">${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className={`text-xs font-mono flex items-center justify-end gap-0.5 ${coin.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {coin.change24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(coin.change24h).toFixed(2)}%
                  </p>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentCoin.icon}</span>
                <div>
                  <CardTitle className="text-lg">{currentCoin.symbol}/USDT</CardTitle>
                  <p className="text-2xl font-bold font-mono text-primary">
                    ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${currentCoin.change24h >= 0 ? 'border-profit text-profit' : 'border-loss text-loss'}`}>
                {currentCoin.change24h >= 0 ? '+' : ''}{currentCoin.change24h.toFixed(2)}% (24h)
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
                    <label className="text-sm text-muted-foreground mb-1 block">Quantidade ({currentCoin.symbol})</label>
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
                    {type === 'buy' ? 'Comprar' : 'Vender'} {currentCoin.symbol}
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
