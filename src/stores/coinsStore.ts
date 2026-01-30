import { create } from 'zustand';
import { binanceAPI } from '../services/binanceApi';
import { useAuthStore } from './authStore';

interface Order {
  price: number;
  quantity: number;
}

interface CoinsState {
  symbol: string;
  price: number;
  changePercent: number;
  bids: Order[];
  asks: Order[];
  availableBalance: number;
  isLoading: boolean;
  setSymbol: (symbol: string) => void;
  setPrice: (price: number) => void;
  setChangePercent: (changePercent: number) => void;
  setOrderBook: (bids: Order[], asks: Order[]) => void;
  setAvailableBalance: (balance: number) => void;
  fetchInitialData: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useCoinsStore = create<CoinsState>((set, get) => ({
  symbol: 'BTCUSDT',
  price: 88843.5,
  changePercent: -0.68,
  bids: [],
  asks: [],
  availableBalance: 0,
  isLoading: true,

  setSymbol: (symbol) => set({ symbol }),

  setPrice: (price) => set({ price }),

  setChangePercent: (changePercent) => set({ changePercent }),

  setOrderBook: (bids, asks) => set({ bids, asks }),

  setAvailableBalance: (availableBalance) => set({ availableBalance }),

  fetchInitialData: async () => {
    const { symbol } = get();
    set({ isLoading: true });

    try {
      // Fetch order book, ticker, and balance in parallel
      const promises: Promise<any>[] = [
        binanceAPI.getOrderBook(symbol),
        binanceAPI.getTicker(symbol),
      ];

      // Fetch balance if user is logged in
      const token = useAuthStore.getState().token;
      if (token) {
        promises.push(
          fetch('/api/coins/balance', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.balances) {
                // Find USDT balance
                const usdtBalance = data.balances.find((b: any) => b.asset === 'USDT');
                return usdtBalance ? usdtBalance.available : 0;
              }
              return 0;
            })
            .catch(() => 0)
        );
      } else {
        promises.push(Promise.resolve(0));
      }

      const [orderBook, ticker, balance] = await Promise.all(promises);

      // Artificial delay to make loading state visible
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({
        bids: orderBook.bids,
        asks: orderBook.asks,
        price: ticker.price,
        changePercent: ticker.changePercent,
        availableBalance: balance || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      set({ isLoading: false });
    }
  },

  refreshBalance: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ availableBalance: 0 });
      return;
    }

    try {
      const response = await fetch('/api/coins/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.balances) {
        // Find USDT balance
        const usdtBalance = data.balances.find((b: any) => b.asset === 'USDT');
        set({ availableBalance: usdtBalance ? usdtBalance.available : 0 });
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  },

  subscribeRealtime: () => {
    const { symbol } = get();
    const cleanups: (() => void)[] = [];

    // Subscribe to order book updates
    const cleanupOrderBook = binanceAPI.subscribeOrderBook(symbol, (bids, asks) => {
      set({ bids, asks });
    });
    cleanups.push(cleanupOrderBook);

    // Subscribe to ticker updates
    const cleanupTicker = binanceAPI.subscribeTicker(symbol, (price, changePercent) => {
      set({ price, changePercent });
    });
    cleanups.push(cleanupTicker);

    // Return cleanup function
    return () => {
      cleanups.forEach((fn) => fn());
    };
  },
}));
