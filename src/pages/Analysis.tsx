import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { coins } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Analysis() {
  const { prices, loading: pricesLoading } = useCryptoPrices();
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichedCoins = coins.map((coin) => {
    const live = prices[coin.symbol];
    return {
      symbol: coin.symbol,
      name: coin.name,
      price: live?.price ?? coin.price,
      change24h: live?.change24h ?? coin.change24h,
    };
  });

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis("");
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ coins: enrichedCoins }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao gerar análise");
      }

      if (!response.body) throw new Error("Stream não disponível");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Análise de Mercado</h1>
          <p className="text-muted-foreground text-sm">Análise inteligente com IA em tempo real</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing || pricesLoading}
          className="glow-primary"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Análise
            </>
          )}
        </Button>
      </div>

      {/* Current prices summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {enrichedCoins.map((coin) => (
          <motion.div
            key={coin.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                <p className="text-sm font-mono font-medium">
                  ${coin.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${coin.change24h >= 0 ? "border-profit text-profit" : "border-loss text-loss"}`}
                >
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analysis result */}
      {error && (
        <Card className="bg-card border-loss/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-loss shrink-0" />
            <p className="text-sm text-loss">{error}</p>
          </CardContent>
        </Card>
      )}

      {(analysis || isAnalyzing) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">Análise IA</CardTitle>
                {isAnalyzing && (
                  <Badge variant="outline" className="text-xs border-primary text-primary animate-pulse">
                    Gerando...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_a]:text-primary">
                <ReactMarkdown>{analysis || "⏳ Aguardando resposta da IA..."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!analysis && !isAnalyzing && !error && (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">
              Nenhuma análise gerada
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md">
              Clique em "Gerar Análise" para que a IA analise o mercado atual com base nos preços reais das moedas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
