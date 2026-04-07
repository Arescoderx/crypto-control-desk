import { useState, useEffect, useCallback } from "react";

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

interface CryptoPrices {
  [symbol: string]: {
    price: number;
    change24h: number;
  };
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
  DOGE: "dogecoin",
};

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrices>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const ids = Object.values(COINGECKO_IDS).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!res.ok) {
        throw new Error(`CoinGecko API error: ${res.status}`);
      }

      const data: Record<string, CoinGeckoPrice> = await res.json();

      const mapped: CryptoPrices = {};
      for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
        if (data[geckoId]) {
          mapped[symbol] = {
            price: data[geckoId].usd,
            change24h: data[geckoId].usd_24h_change ?? 0,
          };
        }
      }

      setPrices(mapped);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch crypto prices:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar preços");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, lastUpdated, error, refetch: fetchPrices };
}
