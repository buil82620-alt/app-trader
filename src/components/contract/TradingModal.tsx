import { useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';

interface TradingModalProps {
  open: boolean;
  onClose: () => void;
  type: 'buy-up' | 'buy-down';
  symbol: string;
  currentPrice: number;
}

interface DurationOption {
  seconds: number;
  profitability: number;
}

const DURATION_OPTIONS: DurationOption[] = [
  { seconds: 30, profitability: 20 },
  { seconds: 60, profitability: 25 },
  { seconds: 90, profitability: 35 },
  { seconds: 120, profitability: 45 },
  { seconds: 180, profitability: 60 },
  { seconds: 360, profitability: 70 },
  { seconds: 420, profitability: 75 },
  { seconds: 510, profitability: 80 },
  { seconds: 620, profitability: 90 },
];

export default function TradingModal({
  open,
  onClose,
  type,
  symbol,
  currentPrice,
}: TradingModalProps) {
  const [side, setSide] = useState<'buy-up' | 'buy-down'>(type);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [tradingModel, setTradingModel] = useState<'USDT' | 'USDC'>('USDT');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useAppTranslation();
  const token = useAuthStore((state) => state.token);

  // keep local side in sync when modal is opened from different buttons
  if (open && side !== type) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // (intentional: tiny sync; avoids needing extra effect)
    setSide(type);
  }

  const selectedOption = DURATION_OPTIONS.find((o) => o.seconds === selectedDuration) ?? DURATION_OPTIONS[0];
  const amount = Number(quantity);
  const isAmountValid = Number.isFinite(amount) && amount > 0;
  const profit = isAmountValid ? (amount * selectedOption.profitability) / 100 : 0;
  const payout = isAmountValid ? amount + profit : 0;

  const handleSubmit = async () => {
    if (!isAmountValid) return;
    if (!token) {
      alert('Please login to place positions');
      window.location.href = '/login';
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert symbol from "BTC/USDT" to "BTCUSDT"
      const apiSymbol = symbol.replace('/', '');

      const response = await fetch('/api/contract/position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: apiSymbol,
          side: side === 'buy-up' ? 'BUY_UP' : 'BUY_DOWN',
          amount,
          duration: selectedDuration,
          currentPrice,
          profitability: selectedOption.profitability,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to create position');
        setIsSubmitting(false);
        return;
      }

      // Success
      alert(
        t('contract.tradingModal.submitted', {
          side: side === 'buy-up' ? t('contract.tradingModal.buy') : t('contract.tradingModal.sell'),
        })
      );

      // Reset form
      setQuantity('');
      onClose();
    } catch (error) {
      console.error('Submit position error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dimmed background */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal sliding from bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between border-b border-gray-700">
          <div className="text-white font-medium text-lg">{symbol}</div>
          <div className="flex flex-col items-end">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition mb-1"
            >
              <svg
                className="w-6 h-6"
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
            <div
              className={`text-sm font-medium ${
                side === 'buy-up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {side === 'buy-up'
                ? t('contract.tradingModal.buy')
                : t('contract.tradingModal.sell')}
            </div>
            <div className="text-white text-xl font-bold mt-1">
              {currentPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* BUY / SELL toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSide('buy-up')}
              className={`py-3 rounded-xl font-semibold transition border ${
                side === 'buy-up'
                  ? 'bg-emerald-400 text-gray-900 border-emerald-400'
                  : 'bg-gray-900 text-white border-gray-700 active:bg-gray-800'
              }`}
            >
              {t('contract.tradingModal.buy')}
            </button>
            <button
              type="button"
              onClick={() => setSide('buy-down')}
              className={`py-3 rounded-xl font-semibold transition border ${
                side === 'buy-down'
                  ? 'bg-red-400 text-gray-900 border-red-400'
                  : 'bg-gray-900 text-white border-gray-700 active:bg-gray-800'
              }`}
            >
              {t('contract.tradingModal.sell')}
            </button>
          </div>

          {/* Purchase Price Section */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">
              {t('contract.tradingModal.purchasePrice')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => {
                const isSelected = selectedDuration === option.seconds;
                return (
                  <button
                    key={option.seconds}
                    onClick={() => setSelectedDuration(option.seconds)}
                    className={`p-3 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-gray-700 bg-gray-900'
                    }`}
                  >
                    <div className="text-white text-xs font-medium mb-1">
                      {option.seconds}
                      {t('contract.tradingModal.secondsSuffix')}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isSelected ? (side === 'buy-up' ? 'text-emerald-400' : 'text-red-400') : 'text-gray-400'
                      }`}
                      >
                      {t('contract.tradingModal.profitability')} {option.profitability}%
                    </div>
                    {isSelected && (
                      <div className="mt-1 flex justify-center">
                        <svg
                          className="w-4 h-4 text-emerald-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trading Model Section */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">
              {t('contract.tradingModal.tradingModel')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTradingModel('USDT')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                  tradingModel === 'USDT'
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">USDT</span>
                  {tradingModel === 'USDT' && (
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
              <button
                onClick={() => setTradingModel('USDC')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                  tradingModel === 'USDC'
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">USDC</span>
                  {tradingModel === 'USDC' && (
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Open Position Quantity */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {t('contract.tradingModal.openQuantity')}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t('contract.tradingModal.openQuantityPlaceholder')}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-400"
            />
            {!isAmountValid && quantity.length > 0 && (
              <div className="mt-2 text-xs text-red-400">
                {t('contract.tradingModal.amountInvalid')}
              </div>
            )}
          </div>

          {/* Account Funds */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {t('contract.tradingModal.fundsLabel')}
            </span>
            <span className="text-gray-400">
              {t('contract.tradingModal.noFunds')}
            </span>
          </div>

          {/* Order summary */}
          <div className="rounded-xl bg-gray-900 border border-gray-700 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {t('contract.tradingModal.profitability')}
              </span>
              <span className={side === 'buy-up' ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                {selectedOption.profitability}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400">
                {t('contract.tradingModal.expectedProfit')}
              </span>
              <span className="text-white">{isAmountValid ? profit.toFixed(2) : '—'}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400">
                {t('contract.tradingModal.expectedPayout')}
              </span>
              <span className="text-white">{isAmountValid ? payout.toFixed(2) : '—'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isAmountValid || isSubmitting}
            className={`w-full text-gray-900 font-semibold py-4 rounded-lg transition ${
              side === 'buy-up' ? 'bg-emerald-400' : 'bg-red-400'
            } ${!isAmountValid || isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {isSubmitting
              ? 'Submitting...'
              : side === 'buy-up'
              ? t('contract.tradingModal.submitBuy')
              : t('contract.tradingModal.submitSell')}
          </button>
        </div>
      </div>
    </div>
  );
}

