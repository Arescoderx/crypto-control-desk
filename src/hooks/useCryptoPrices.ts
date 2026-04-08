import { useEffect, useState } from "react";

const CACHE_KEY = "crypto-prices-cache";

export function useCryptoPrices() {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,cardano,dogecoin&vs_currencies=usd&include_24hr_change=true"
      );

      const data = await res.json();

      const formatted = {
        BTC: {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change,
        },
        ETH: {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change,
        },
        SOL: {
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change,
        },
        BNB: {
          price: data.binancecoin.usd,
          change24h: data.binancecoin.usd_24h_change,
        },

        // 🔥 ADICIONAR
        ADA: {
          price: data.cardano.usd,
          change24h: data.cardano.usd_24h_change,
        },
        DOGE: {
          price: data.dogecoin.usd,
          change24h: data.dogecoin.usd_24h_change,
        },
      };

      setPrices(formatted);
      setLastUpdated(new Date());
      setLoading(false);

      // 🔥 salva cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: formatted,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Erro ao buscar preços:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔥 carrega cache primeiro (instantâneo)
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        setPrices(parsed.data);
        setLastUpdated(new Date(parsed.timestamp));
        setLoading(false);
      } catch { }
    }

    // 🔥 depois atualiza com API
    fetchPrices();

    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, lastUpdated, refetch: fetchPrices };
}