import { useAppTranslation } from '../../hooks/useAppTranslation';

interface AssetBalance {
  asset: string;
  available: number;
  locked: number;
  total: number;
}

interface Props {
  balance: AssetBalance;
  isVisible: boolean;
  accountType: 'coins' | 'contract' | 'futures' | 'forex';
  onClick: () => void;
}

export default function AssetItem({ balance, isVisible, accountType, onClick }: Props) {
  const { t } = useAppTranslation();

  const formatAmount = (amount: number) => {
    if (!isVisible) return '****';
    return amount.toFixed(8);
  };

  // Simplified conversion to USDT (in production, use real-time prices)
  const getUsdtValue = (asset: string, amount: number): number => {
    if (asset === 'USDT' || asset === 'USDC') return amount;
    // Demo prices - in production fetch from API
    const prices: Record<string, number> = {
      BTC: 87998.11,
      ETH: 3200,
      BCH: 250,
      LTC: 80,
      DOT: 7,
      UNI: 7,
      XAU: 2400,
      HNKI: 0.1,
      QCX: 0.05,
      KXSE: 0.5,
    };
    return amount * (prices[asset] || 0);
  };

  const convertedUsdt = getUsdtValue(balance.asset, balance.total);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[calc(100%-2rem)] px-4 py-4 bg-[#22272d] rounded-lg mb-2 mx-4 active:bg-[#2a2f35] transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 text-left">
          <div className="text-white text-base font-medium mb-3">{balance.asset}</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{t('assets.available')}:</span>
              <span className="text-gray-200">{formatAmount(balance.available)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{t('assets.underReview')}:</span>
              <span className="text-gray-200">{formatAmount(balance.locked)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{t('assets.converted')}:</span>
              <span className="text-gray-200">{formatAmount(convertedUsdt)}</span>
            </div>
          </div>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500 ml-4 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
}

