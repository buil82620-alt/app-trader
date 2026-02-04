import { create } from 'zustand';

interface OrderResult {
  positionId: number;
  symbol: string;
  side: 'BUY_UP' | 'BUY_DOWN';
  amount: number;
  entryPrice: number;
  exitPrice: number;
  duration: number;
  profitability: number;
  actualProfit: number;
  result: 'WIN' | 'LOSS';
  handlingFee: number;
  createdAt: string;
  closedAt: string;
}

interface OrderResultState {
  result: OrderResult | null;
  showModal: boolean;
  setResult: (result: OrderResult | null) => void;
  showResultModal: (result: OrderResult) => void;
  closeResultModal: () => void;
}

export const useOrderResultStore = create<OrderResultState>((set) => ({
  result: null,
  showModal: false,
  setResult: (result) => set({ result }),
  showResultModal: (result) => set({ result, showModal: true }),
  closeResultModal: () => set({ result: null, showModal: false }),
}));

