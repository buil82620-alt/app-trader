import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useOrderResultStore } from '../../stores/orderResultStore';

export default function OrderResultModal() {
  const { result, showModal, closeResultModal } = useOrderResultStore();
  const { t } = useAppTranslation();

  if (!showModal || !result) return null;

  const displaySymbol = result.symbol.replace('USDT', '/USDT');
  const isWin = result.result === 'WIN';
  const profitDisplay = isWin ? `+ ${result.actualProfit.toFixed(4)}` : `${result.actualProfit.toFixed(4)}`;

  // Format datetime
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl w-80 px-5 py-6 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold text-base">
            {displaySymbol}({result.duration}s)
          </div>
          <button
            type="button"
            onClick={closeResultModal}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Profit/Loss - Large green/red text */}
        <div className={`text-center mb-4 ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
          <div className="text-2xl font-bold">
            {profitDisplay}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Transaction Type</span>
            <span className={result.side === 'BUY_UP' ? 'text-emerald-400' : 'text-red-400'}>
              {result.side === 'BUY_UP'
                ? t('contract.tradingModal.buy')
                : t('contract.tradingModal.sell')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Quantity</span>
            <span className="text-white">{result.amount.toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Purchase price</span>
            <span className="text-white">{result.entryPrice.toFixed(6)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Final price</span>
            <span className="text-white">{result.exitPrice.toFixed(6)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Transaction time/second</span>
            <span className="text-white">{result.duration}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Profitability</span>
            <span className="text-emerald-400">{result.profitability}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Profit and loss</span>
            <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
              {profitDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Handling fee</span>
            <span className="text-white">{result.handlingFee.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Opening time</span>
            <span className="text-white text-xs">{formatDateTime(result.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Close time</span>
            <span className="text-white text-xs">{formatDateTime(result.closedAt)}</span>
          </div>
        </div>

        {/* OK Button */}
        <button
          type="button"
          onClick={closeResultModal}
          className="mt-4 w-full py-3 rounded-xl bg-emerald-400 text-gray-900 font-semibold text-sm active:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
}

