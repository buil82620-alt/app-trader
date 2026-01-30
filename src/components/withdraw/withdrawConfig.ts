export interface WithdrawAsset {
  symbol: string;
  label: string;
  coingeckoId: string;
}

export const WITHDRAW_ASSETS: WithdrawAsset[] = [
  { symbol: 'USDT', label: 'USDT Withdraw', coingeckoId: 'tether' },
  { symbol: 'BTC', label: 'BTC Withdraw', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', label: 'ETH Withdraw', coingeckoId: 'ethereum' },
  { symbol: 'LTC', label: 'LTC Withdraw', coingeckoId: 'litecoin' },
  { symbol: 'SOL', label: 'SOL Withdraw', coingeckoId: 'solana' },
  { symbol: 'XRP', label: 'XRP Withdraw', coingeckoId: 'ripple' },
  { symbol: 'USDC', label: 'USDC Withdraw', coingeckoId: 'usd-coin' },
  { symbol: 'BNB', label: 'BNB Withdraw', coingeckoId: 'binancecoin' },
];


