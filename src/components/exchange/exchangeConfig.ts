export interface ExchangeCoin {
  symbol: string;
  // demo price vs USDT for rate calculation
  usdtPrice: number;
}

export const EXCHANGE_COINS: ExchangeCoin[] = [
  { symbol: 'USDT', usdtPrice: 1 },
  { symbol: 'BTC', usdtPrice: 87998.11 },
  { symbol: 'ETH', usdtPrice: 3200 },
  { symbol: 'BCH', usdtPrice: 250 },
  { symbol: 'LTC', usdtPrice: 80 },
  { symbol: 'UNI', usdtPrice: 7 },
  { symbol: 'XAU', usdtPrice: 2400 },
  { symbol: 'FIG', usdtPrice: 1 },
  { symbol: 'COMB', usdtPrice: 0.5 },
  { symbol: 'EBUN', usdtPrice: 0.2 },
  { symbol: 'KXSE', usdtPrice: 0.5 },
  { symbol: 'ETF', usdtPrice: 1 },
  { symbol: 'ALRA', usdtPrice: 0.3 },
];

export function getPrice(symbol: string): number {
  const found = EXCHANGE_COINS.find((c) => c.symbol === symbol);
  return found?.usdtPrice ?? 1;
}


