import { useEffect, useState } from 'react';
import MarketCard from './MarketCard';
import { binanceAPI } from '../../services/binanceApi';

type Trend = 'up' | 'down';

interface SparkPoint {
  time: number;
  value: number;
}

interface MarketConfig {
  label: string; // e.g. BTC/USDT
  binanceSymbol: string; // e.g. BTCUSDT
}

interface MarketState extends MarketConfig {
  price: number;
  changePercent: number;
  trend: Trend;
  sparkline: SparkPoint[];
}

const MARKET_CONFIGS: MarketConfig[] = [
  { label: 'BTC/USDT', binanceSymbol: 'BTCUSDT' },
  { label: 'ETH/USDT', binanceSymbol: 'ETHUSDT' },
  { label: 'BCH/USDT', binanceSymbol: 'BCHUSDT' },
  { label: 'LTC/USDT', binanceSymbol: 'LTCUSDT' },
  { label: 'UNI/USDT', binanceSymbol: 'UNIUSDT' },
];

export default function MarketCards() {
  const [markets, setMarkets] = useState<MarketState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const results = await Promise.all(
          MARKET_CONFIGS.map(async (cfg) => {
            const [ticker, candles] = await Promise.all([
              binanceAPI.getTicker(cfg.binanceSymbol),
              binanceAPI.getCandlestickData(cfg.binanceSymbol, '5m', 50),
            ]);

            const sparkline: SparkPoint[] = candles.map((c) => ({
              time: c.time,
              value: c.close,
            }));

            const trend: Trend = ticker.changePercent >= 0 ? 'up' : 'down';

            return {
              ...cfg,
              price: ticker.price,
              changePercent: ticker.changePercent,
              trend,
              sparkline,
            } as MarketState;
          })
        );

        if (!cancelled) {
          setMarkets(results);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading market cards:', err);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    const unsubscribers = MARKET_CONFIGS.map((cfg) =>
      binanceAPI.subscribeTicker(cfg.binanceSymbol, (price, changePercent) => {
        setMarkets((prev) => {
          const trend: Trend = changePercent >= 0 ? 'up' : 'down';
          const existing = prev.find((m) => m.binanceSymbol === cfg.binanceSymbol);
          if (!existing) return prev;
          return prev.map((m) =>
            m.binanceSymbol === cfg.binanceSymbol
              ? { ...m, price, changePercent, trend }
              : m
          );
        });
      })
    );

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, []);

  return (
    <div className="bg-gray-900 px-4 py-4">
      <div className="flex overflow-x-auto scrollbar-hide pb-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[140px] bg-gray-800/70 rounded-xl p-4 mr-3 animate-pulse"
              >
                <div className="h-3 w-16 bg-gray-700 rounded mb-3" />
                <div className="h-8 bg-gray-700 rounded mb-3" />
                <div className="h-4 w-20 bg-gray-700 rounded" />
              </div>
            ))
          : markets.map((market) => (
              <MarketCard
                key={market.binanceSymbol}
                symbol={market.label}
                price={market.price}
                changePercent={market.changePercent}
                trend={market.trend}
                sparkline={market.sparkline}
              />
            ))}
      </div>
    </div>
  );
}

