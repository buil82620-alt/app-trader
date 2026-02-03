import { useEffect, useState } from 'react';
import AssetListItem from './AssetListItem';
import { binanceAPI } from '../../services/binanceApi';
import { fetchCoingeckoMarkets } from '../../services/coingeckoApi';
import { useCoinsStore } from '../../stores/coinsStore';
import LoadingSpinner from '../shared/LoadingSpinner';

type Trend = 'up' | 'down';

interface SparkPoint {
  time: number;
  value: number;
}

interface AssetConfig {
  symbol: string;        // display symbol, e.g. BTC, XAUUSD
  pair: string;          // display pair, e.g. BTC/USDT, XAUUSD
  binanceSymbol: string; // symbol used to query data from Binance or another API
  logoUrl?: string;
  logoBgColor?: string;
  coingeckoId?: string;  // optional, only for coins supported by Coingecko
  variant?: 'default' | 'derivative';
}

interface AssetState extends AssetConfig {
  price: number;
  changePercent: number;
  trend: Trend;
  sparkline: SparkPoint[];
}

const USDT_ASSETS: AssetConfig[] = [
  {
    symbol: 'BTC',
    pair: 'BTC/USDT',
    binanceSymbol: 'BTCUSDT',
    logoBgColor: '#F7931A',
    coingeckoId: 'bitcoin',
  },
  {
    symbol: 'ETH',
    pair: 'ETH/USDT',
    binanceSymbol: 'ETHUSDT',
    logoBgColor: '#3C3C3D',
    coingeckoId: 'ethereum',
  },
  {
    symbol: 'BCH',
    pair: 'BCH/USDT',
    binanceSymbol: 'BCHUSDT',
    logoBgColor: '#0AC18E',
    coingeckoId: 'bitcoin-cash',
  },
  {
    symbol: 'LTC',
    pair: 'LTC/USDT',
    binanceSymbol: 'LTCUSDT',
    logoBgColor: '#345D9D',
    coingeckoId: 'litecoin',
  },
  {
    symbol: 'UNI',
    pair: 'UNI/USDT',
    binanceSymbol: 'UNIUSDT',
    logoBgColor: '#FF007A',
    coingeckoId: 'uniswap',
  },
  {
    symbol: 'XAU',
    pair: 'XAU/USDT',
    // Binance không có cặp XAUUSDT, dùng PAXGUSDT (PAX Gold) để đại diện giá vàng
    binanceSymbol: 'PAXGUSDT',
    logoBgColor: '#C49B3F',
    coingeckoId: 'pax-gold',
  },
  {
    symbol: 'DOT',
    pair: 'DOT/USDT',
    binanceSymbol: 'DOTUSDT',
    logoBgColor: '#E11D48',
    coingeckoId: 'polkadot',
  },
  {
    symbol: 'SOL',
    pair: 'SOL/USDT',
    binanceSymbol: 'SOLUSDT',
    logoBgColor: '#14B8A6',
    coingeckoId: 'solana',
  },
  {
    symbol: 'TRB',
    pair: 'TRB/USDT',
    binanceSymbol: 'TRBUSDT',
    logoBgColor: '#0891B2',
    coingeckoId: 'tellor',
  },
  {
    symbol: 'TRX',
    pair: 'TRX/USDT',
    binanceSymbol: 'TRXUSDT',
    logoBgColor: '#EF4444',
    coingeckoId: 'tron',
  },
  {
    symbol: 'XRP',
    pair: 'XRP/USDT',
    binanceSymbol: 'XRPUSDT',
    logoBgColor: '#111827',
    coingeckoId: 'ripple',
  },
  {
    symbol: 'TRUMP',
    pair: 'TRUMP/USDT',
    binanceSymbol: 'TRUMPUSDT',
    logoBgColor: '#16A34A',
  },
];

// Derivatives tab assets (forex, commodities, indices, etc.)
const DERIVATIVE_ASSETS: AssetConfig[] = [
  {
    symbol: 'XAUUSD',
    pair: 'XAUUSD',
    binanceSymbol: 'XAUUSDT',
    logoBgColor: '#C49B3F',
    variant: 'derivative',
  },
  {
    symbol: 'EURUSD',
    pair: 'EURUSD',
    binanceSymbol: 'EURUSDT',
    logoBgColor: '#0EA5E9',
    variant: 'derivative',
  },
  {
    symbol: 'UKOil',
    pair: 'UKOIL',
    binanceSymbol: 'UKOILUSDT',
    logoBgColor: '#4B5563',
    variant: 'derivative',
  },
  {
    symbol: 'USOil',
    pair: 'USOIL',
    binanceSymbol: 'USOILUSDT',
    logoBgColor: '#6B7280',
    variant: 'derivative',
  },
  {
    symbol: 'XAGUSD',
    pair: 'XAGUSD',
    binanceSymbol: 'XAGUSDT',
    logoBgColor: '#9CA3AF',
    variant: 'derivative',
  },
  {
    symbol: 'JPYUSD',
    pair: 'JPYUSD',
    binanceSymbol: 'JPYUSDT',
    logoBgColor: '#1D4ED8',
    variant: 'derivative',
  },
  {
    symbol: 'AUDUSD',
    pair: 'AUDUSD',
    binanceSymbol: 'AUDUSDT',
    logoBgColor: '#22C55E',
    variant: 'derivative',
  },
];

export default function AssetListTab() {
  const [activeTab, setActiveTab] = useState<'USDT' | 'Derivatives'>('USDT');
  const [usdtAssets, setUsdtAssets] = useState<AssetState[]>([]);
  const [derivativeAssets, setDerivativeAssets] = useState<AssetState[]>([]);
  const [isLoadingUsdt, setIsLoadingUsdt] = useState(true);
  const [isLoadingDerivatives, setIsLoadingDerivatives] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAssets = async () => {
      try {
        setIsLoadingUsdt(true);
        // Lấy icon từ Coingecko
        const ids = USDT_ASSETS.map((a) => a.coingeckoId).filter(
          (id): id is string => Boolean(id)
        );
        const markets = await fetchCoingeckoMarkets(ids);
        const logoMap = new Map<string, string>();
        markets.forEach((m) => {
          logoMap.set(m.id, m.image);
        });

        const results: AssetState[] = await Promise.all(
          USDT_ASSETS.map(async (cfg) => {
            const [ticker, candles] = await Promise.all([
              binanceAPI.getTicker(cfg.binanceSymbol),
              binanceAPI.getCandlestickData(cfg.binanceSymbol, '5m', 50),
            ]);

            const sparkline: SparkPoint[] = candles.map((c) => ({
              time: c.time,
              value: c.close,
            }));

            const trend: Trend = ticker.changePercent >= 0 ? 'up' : 'down';
            const logoUrl =
              cfg.coingeckoId && logoMap.has(cfg.coingeckoId)
                ? logoMap.get(cfg.coingeckoId)
                : cfg.logoUrl;

            return {
              ...cfg,
              logoUrl,
              price: ticker.price,
              changePercent: ticker.changePercent,
              trend,
              sparkline,
            } as AssetState;
          })
        );

        if (!cancelled) {
          setUsdtAssets(results);
          setIsLoadingUsdt(false);
        }
      } catch (error) {
        console.error('Error loading USDT assets:', error);
        if (!cancelled) {
          setIsLoadingUsdt(false);
        }
      }
    };

    loadAssets();

    const unsubscribers = USDT_ASSETS.map((cfg) =>
      binanceAPI.subscribeTicker(cfg.binanceSymbol, (price, changePercent) => {
        setUsdtAssets((prev) => {
          const existing = prev.find((a) => a.binanceSymbol === cfg.binanceSymbol);
          if (!existing) return prev;
          const trend: Trend = changePercent >= 0 ? 'up' : 'down';
          return prev.map((a) =>
            a.binanceSymbol === cfg.binanceSymbol
              ? { ...a, price, changePercent, trend }
              : a
          );
        });
      })
    );

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, []);

  // Load Derivatives tab data
  useEffect(() => {
    let cancelled = false;

    const loadDerivatives = async () => {
      try {
        setIsLoadingDerivatives(true);
        const results: AssetState[] = await Promise.all(
          DERIVATIVE_ASSETS.map(async (cfg) => {
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
            } as AssetState;
          })
        );

        if (!cancelled) {
          setDerivativeAssets(results);
          setIsLoadingDerivatives(false);
        }
      } catch (error) {
        console.error('Error loading derivative assets:', error);
        if (!cancelled) {
          setIsLoadingDerivatives(false);
        }
      }
    };

    loadDerivatives();

    const unsubscribers = DERIVATIVE_ASSETS.map((cfg) =>
      binanceAPI.subscribeTicker(cfg.binanceSymbol, (price, changePercent) => {
        setDerivativeAssets((prev) => {
          const existing = prev.find((a) => a.binanceSymbol === cfg.binanceSymbol);
          if (!existing) return prev;
          const trend: Trend = changePercent >= 0 ? 'up' : 'down';
          return prev.map((a) =>
            a.binanceSymbol === cfg.binanceSymbol
              ? { ...a, price, changePercent, trend }
              : a
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
    <div className="bg-gray-900">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 px-4">
        <button
          onClick={() => setActiveTab('USDT')}
          className={`px-4 py-3 font-medium text-sm relative ${
            activeTab === 'USDT' ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          USDT
          {activeTab === 'USDT' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('Derivatives')}
          className={`px-4 py-3 font-medium text-sm relative ${
            activeTab === 'Derivatives' ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          Derivatives
          {activeTab === 'Derivatives' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></span>
          )}
        </button>
      </div>

      {/* Asset List */}
      <div className="mt-4">
        {activeTab === 'USDT' &&
          (isLoadingUsdt ? (
            <LoadingSpinner />
          ) : (
            usdtAssets.map((asset) => (
              <AssetListItem
                key={asset.binanceSymbol}
                symbol={asset.symbol}
                pair={asset.pair}
                price={asset.price}
                changePercent={asset.changePercent}
                trend={asset.trend}
                logoUrl={asset.logoUrl}
                logoBgColor={asset.logoBgColor}
                sparkline={asset.sparkline}
                onClick={() => {
                  // Set symbol in coins store and navigate to coins page
                  useCoinsStore.getState().setSymbol(asset.binanceSymbol);
                  window.location.href = `/coins?symbol=${asset.binanceSymbol}`;
                }}
              />
            ))
          ))}

        {activeTab === 'Derivatives' &&
          (isLoadingDerivatives ? (
            <LoadingSpinner />
          ) : (
            derivativeAssets.map((asset) => (
              <AssetListItem
                key={asset.binanceSymbol}
                symbol={asset.symbol}
                pair={asset.pair}
                price={asset.price}
                changePercent={asset.changePercent}
                trend={asset.trend}
                logoUrl={asset.logoUrl}
                logoBgColor={asset.logoBgColor}
                sparkline={asset.sparkline}
                variant={asset.variant}
              />
            ))
          ))}
      </div>
    </div>
  );
}

