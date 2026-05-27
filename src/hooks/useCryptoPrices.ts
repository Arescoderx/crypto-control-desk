import { useEffect, useState } from "react";

const CACHE_KEY = "crypto-prices-cache";

const FALLBACK_PRICES = {
  BTC: { price: 65000, change24h: 1.2 },
  ETH: { price: 3200, change24h: 0.8 },
  SOL: { price: 145, change24h: -0.4 },
  BNB: { price: 590, change24h: 0.3 },
  ADA: { price: 0.45, change24h: -1.1 },
  DOGE: { price: 0.13, change24h: 2.4 },
};

function normalizePrices(data: any) {
  return {
    BTC: {
      price: Number(data?.bitcoin?.usd || FALLBACK_PRICES.BTC.price),
      change24h: Number(data?.bitcoin?.usd_24h_change || FALLBACK_PRICES.BTC.change24h),
    },
    ETH: {
      price: Number(data?.ethereum?.usd || FALLBACK_PRICES.ETH.price),
      change24h: Number(data?.ethereum?.usd_24h_change || FALLBACK_PRICES.ETH.change24h),
    },
    SOL: {
      price: Number(data?.solana?.usd || FALLBACK_PRICES.SOL.price),
      change24h: Number(data?.solana?.usd_24h_change || FALLBACK_PRICES.SOL.change24h),
    },
    BNB: {
      price: Number(data?.binancecoin?.usd || FALLBACK_PRICES.BNB.price),
      change24h: Number(data?.binancecoin?.usd_24h_change || FALLBACK_PRICES.BNB.change24h),
    },
    ADA: {
      price: Number(data?.cardano?.usd || FALLBACK_PRICES.ADA.price),
      change24h: Number(data?.cardano?.usd_24h_change || FALLBACK_PRICES.ADA.change24h),
    },
    DOGE: {
      price: Number(data?.dogecoin?.usd || FALLBACK_PRICES.DOGE.price),
      change24h: Number(data?.dogecoin?.usd_24h_change || FALLBACK_PRICES.DOGE.change24h),
    },
  };
}

function readCachedPrices() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    if (!parsed?.data) return null;

    return {
      data: parsed.data,
      timestamp: Number(parsed.timestamp || Date.now()),
    };
  } catch {
    return null;
  }
}

function cachePrices(data: Record<string, any>, timestamp = Date.now()) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp,
    })
  );
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const applyPrices = (data: Record<string, any>, timestamp = Date.now()) => {
    setPrices(data);
    setLastUpdated(new Date(timestamp));
    setLoading(false);
    cachePrices(data, timestamp);
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,cardano,dogecoin&vs_currencies=usd&include_24hr_change=true"
      );

      if (!res.ok) {
        throw new Error("Falha ao buscar precos");
      }

      const data = await res.json();
      applyPrices(normalizePrices(data));
    } catch {
      const cached = readCachedPrices();

      if (cached) {
        applyPrices(cached.data, cached.timestamp);
        return;
      }

      applyPrices(FALLBACK_PRICES);
    }
  };

  useEffect(() => {
    const cached = readCachedPrices();

    if (cached) {
      setPrices(cached.data);
      setLastUpdated(new Date(cached.timestamp));
      setLoading(false);
    } else {
      applyPrices(FALLBACK_PRICES);
    }

    fetchPrices();

    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, lastUpdated, refetch: fetchPrices };
}
