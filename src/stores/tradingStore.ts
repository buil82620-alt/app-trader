import { create } from 'zustand';

export interface Position {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

interface TradingState {
  balance: number;
  positions: Position[];
  orders: Order[];
  selectedSymbol: string;
  
  // Actions
  setBalance: (balance: number) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  removePosition: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setSelectedSymbol: (symbol: string) => void;
  calculateTotalPnl: () => number;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  balance: 10000,
  positions: [],
  orders: [],
  selectedSymbol: 'BTC/USDT',

  setBalance: (balance) => set({ balance }),

  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, position],
    })),

  updatePosition: (id, updates) =>
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.id === id ? { ...pos, ...updates } : pos
      ),
    })),

  removePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((pos) => pos.id !== id),
    })),

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),

  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    })),

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  calculateTotalPnl: () => {
    const { positions } = get();
    return positions.reduce((total, pos) => total + pos.pnl, 0);
  },
}));
