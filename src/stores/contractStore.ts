import { create } from 'zustand';
import { binanceAPI } from '../services/binanceApi';

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M';

interface Candlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ContractState {
  symbol: string;
  price: number;
  changePercent: number;
  high: number;
  low: number;
  volume24h: number;
  timeframe: Timeframe;
  candlestickData: Candlestick[];
  isLoading: boolean;
  setSymbol: (symbol: string) => void;
  setPrice: (price: number) => void;
  setChangePercent: (changePercent: number) => void;
  setStatistics: (high: number, low: number, volume24h: number) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setCandlestickData: (data: Candlestick[]) => void;
  fetchInitialData: () => Promise<void>;
  subscribeRealtime: () => () => void;
}

const timeframeMap: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '1d': '1d',
  '1w': '1w',
  '1M': '1M',
};

export const useContractStore = create<ContractState>((set, get) => ({
  symbol: 'BTCUSDT',
  price: 88985.29,
  changePercent: -0.53,
  high: 89468.34,
  low: 88831.99,
  volume24h: 9724.2669,
  timeframe: '1m',
  candlestickData: [],
  isLoading: true,

  setSymbol: (symbol) => set({ symbol }),

  setPrice: (price) => set({ price }),

  setChangePercent: (changePercent) => set({ changePercent }),

  setStatistics: (high, low, volume24h) => set({ high, low, volume24h }),

  setTimeframe: (timeframe) => set({ timeframe }),

  setCandlestickData: (candlestickData) => set({ candlestickData }),

  fetchInitialData: async () => {
    const state = get();
    set({ isLoading: true });

    try {
      // Fetch ticker, statistics, and candlestick data in parallel
      const [ticker, stats, candlestickData] = await Promise.all([
        binanceAPI.getTicker(state.symbol),
        binanceAPI.get24hStats(state.symbol),
        binanceAPI.getCandlestickData(state.symbol, timeframeMap[state.timeframe], 500),
      ]);

      set({
        price: ticker.price,
        changePercent: ticker.changePercent,
        high: stats.high,
        low: stats.low,
        volume24h: stats.volume,
        candlestickData,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      set({ isLoading: false });
    }
  },

  subscribeRealtime: () => {
    const { symbol, timeframe } = get();
    const cleanups: (() => void)[] = [];

    // Subscribe to ticker updates
    const cleanupTicker = binanceAPI.subscribeTicker(symbol, (price, changePercent) => {
      set({ price, changePercent });
    });
    cleanups.push(cleanupTicker);

    // Subscribe to candlestick updates
    const cleanupCandlestick = binanceAPI.subscribeCandlestick(
      symbol,
      timeframeMap[timeframe],
      (candle) => {
        const { candlestickData } = get();
        // Update last candle or add new one
        const lastCandle = candlestickData[candlestickData.length - 1];
        if (lastCandle && Math.abs(lastCandle.time - candle.time) < 60) {
          // Update existing candle
          const updated = [...candlestickData];
          updated[updated.length - 1] = candle;
          set({ candlestickData: updated });
        } else {
          // Add new candle
          set({ candlestickData: [...candlestickData, candle].slice(-500) });
        }
      }
    );
    cleanups.push(cleanupCandlestick);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  },
}));
