import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { executeTrade } from "@/lib/trading";
import { toast } from "sonner";

// 🔥 moedas fixas (SEM MOCK QUEBRADO)
const COINS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "BNB", name: "BNB", icon: "◆" },
  { symbol: "ADA", name: "Cardano", icon: "₳" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
];

export default function Trading() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [amount, setAmount] = useState("");

  const { prices, loading, lastUpdated, refetch } = useCryptoPrices();


  const enrichedCoins = COINS.map((coin) => {
    const live = prices[coin.symbol];

    return {
      ...coin,
      price: live?.price ?? 0,
      change24h: live?.change24h ?? 0,
    };
  });

  const currentCoin =
    enrichedCoins.find((c) => c.symbol === selectedSymbol) || enrichedCoins[0];

  const currentPrice = currentCoin.price || 0;
  const total = parseFloat(amount || "0") * currentPrice;

  const handleTrade = (type: "buy" | "sell") => {
    try {
      const parsedAmount = parseFloat(amount);

      if (!parsedAmount || parsedAmount <= 0) {
        toast.error("Quantidade inválida");
        return;
      }

      executeTrade({
        symbol: currentCoin.symbol,
        name: currentCoin.name,
        type,
        price: currentPrice,
        amount: parsedAmount,
      });

      toast.success(
        type === "buy"
          ? "Compra realizada com sucesso"
          : "Venda realizada com sucesso"
      );

      setAmount("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* 🔥 LOADING SUAVE */}
      {loading && Object.keys(prices).length === 0 && (
        <div className="text-sm text-muted-foreground">
          Carregando preços...
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Trading</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">
              Compra e venda manual
            </p>

            {lastUpdated && (
              <span className="text-xs text-muted-foreground/60">
                · Atualizado {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={refetch}
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LISTA DE MOEDAS */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moedas
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
            {enrichedCoins.map((coin) => (
              <motion.button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedSymbol === coin.symbol
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-accent/50"
                  }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{coin.icon}</span>

                  <div className="text-left">
                    <p className="font-medium text-sm">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {coin.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-mono">
                    $
                    {coin.price
                      ? coin.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      : "--"}
                  </p>

                  <p
                    className={`text-xs font-mono flex items-center justify-end gap-0.5 ${coin.change24h >= 0 ? "text-profit" : "text-loss"
                      }`}
                  >
                    {coin.change24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}

                    {Math.abs(coin.change24h).toFixed(2)}%
                  </p>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* PAINEL DE TRADE */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentCoin.icon}</span>

                <div>
                  <CardTitle className="text-lg">
                    {currentCoin.symbol}/USDT
                  </CardTitle>

                  <p className="text-2xl font-bold font-mono text-primary">
                    $
                    {currentPrice
                      ? currentPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      : "--"}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`${currentCoin.change24h >= 0
                    ? "border-profit text-profit"
                    : "border-loss text-loss"
                  }`}
              >
                {currentCoin.change24h >= 0 ? "+" : ""}
                {currentCoin.change24h.toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="buy" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="buy">Comprar</TabsTrigger>
                <TabsTrigger value="sell">Vender</TabsTrigger>
              </TabsList>

              {(["buy", "sell"] as const).map((type) => (
                <TabsContent key={type} value={type} className="space-y-4 mt-4">
                  <Input value={currentPrice.toFixed(2)} readOnly />

                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="text-sm text-muted-foreground">
                    Total: ${total.toFixed(2)}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!amount}
                    onClick={() => handleTrade(type)}
                  >
                    {type === "buy" ? "Comprar" : "Vender"}{" "}
                    {currentCoin.symbol}
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