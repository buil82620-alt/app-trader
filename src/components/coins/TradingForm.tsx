import { useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';
import { useCoinsStore } from '../../stores/coinsStore';

interface TradingFormProps {
  currentPrice: number;
  availableBalance: number;
}

export default function TradingForm({ currentPrice, availableBalance }: TradingFormProps) {
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [priceMode, setPriceMode] = useState<'market' | 'limit'>('market');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useAppTranslation();
  const token = useAuthStore((state) => state.token);
  const symbol = useCoinsStore((state) => state.symbol);
  const refreshBalance = useCoinsStore((state) => state.refreshBalance);

  const effectivePrice = () => {
    if (priceMode === 'market') {
      return currentPrice;
    }
    const p = parseFloat(price);
    return Number.isFinite(p) && p > 0 ? p : 0;
  };

  const handlePercentageChange = (percent: number) => {
    setPercentage(percent);
    const p = effectivePrice();
    if (p > 0) {
      const maxQuantity = availableBalance / p;
      const calculatedQuantity = (maxQuantity * percent) / 100;
      setQuantity(calculatedQuantity.toFixed(6));
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      alert('Please login to place orders');
      window.location.href = '/login';
      return;
    }

    const p = effectivePrice();
    const q = parseFloat(quantity);

    if (!p || !Number.isFinite(p)) {
      alert(t('coins.tradingForm.errors.priceRequired'));
      return;
    }

    if (!q || !Number.isFinite(q) || q <= 0) {
      alert(t('coins.tradingForm.errors.quantityRequired'));
      return;
    }

    const total = p * q;
    if (total > availableBalance) {
      alert(t('coins.tradingForm.errors.insufficient'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coins/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol,
          side: orderSide.toUpperCase(),
          type: priceMode.toUpperCase(),
          price: priceMode === 'limit' ? p : undefined,
          quantity: q,
          currentPrice: priceMode === 'market' ? currentPrice : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || t('coins.tradingForm.errors.submitFailed'));
        setIsSubmitting(false);
        return;
      }

      // Success
      const feeRate = 0.00001;
      const fee = total * feeRate;
      alert(
        t('coins.tradingForm.toast', {
          side: orderSide.toUpperCase(),
          mode: priceMode,
          price: p.toFixed(2),
          quantity: q.toFixed(6),
          total: total.toFixed(2),
          fee: fee.toFixed(6),
        })
      );

      // Reset form
      setQuantity('');
      setPercentage(0);
      setPrice('');

      // Refresh balance
      if (refreshBalance) {
        await refreshBalance();
      }
    } catch (error) {
      console.error('Submit order error:', error);
      alert(t('coins.tradingForm.errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 px-4 py-4">
      {/* Order Type Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setOrderSide('buy')}
          className={`py-1 px-3 rounded-full font-medium transition ${
            orderSide === 'buy'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          {t('coins.tradingForm.buy')}
        </button>
        <button
          onClick={() => setOrderSide('sell')}
          className={`py-2.5 px-4 rounded-full font-medium transition ${
            orderSide === 'sell'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          {t('coins.tradingForm.sell')}
        </button>
        <button
          onClick={() =>
            setPriceMode((m) => (m === 'market' ? 'limit' : 'market'))
          }
          className="flex-1 py-2.5 px-4 rounded-full font-medium bg-gray-800 text-gray-300 flex items-center justify-center gap-1"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-xs mr-1">
            !
          </span>
          <span>
            {priceMode === 'market'
              ? t('coins.tradingForm.marketPrice')
              : t('coins.tradingForm.limitPrice')}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Card container */}
      <div className="bg-gray-800 rounded-3xl px-4 py-4 mt-1">
        {/* Price section */}
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">
            {t('coins.tradingForm.priceLabel')}
          </label>
          {priceMode === 'market' ? (
            <div className="py-2">
              <p className="text-gray-400 text-sm">
                {t('coins.tradingForm.tradeAtBest')}
              </p>
              <div className="mt-2 h-px w-full bg-gray-700" />
            </div>
          ) : (
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={
                currentPrice ? currentPrice.toString() : t('coins.tradingForm.priceLabel')
              }
              className="w-full bg-transparent text-white px-0 py-2 text-sm border-b border-gray-700 focus:outline-none focus:border-emerald-400"
            />
          )}
        </div>

        {/* Quantity section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-400 text-xs">
              {t('coins.tradingForm.quantityLabel')}
            </label>
            <span className="text-red-500 text-xs">
              {t('coins.tradingForm.feeLabel')}
            </span>
          </div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('coins.tradingForm.quantityPlaceholder')}
            className="w-full bg-transparent text-white px-0 py-2 text-sm border-b border-gray-700 focus:outline-none focus:border-emerald-400"
          />

          {/* Percentage Slider */}
          <div className="mt-3">
            <div className="flex items-center mb-2">
              <span className="text-gray-400 text-xs w-10">{percentage}%</span>
              <div className="flex-1 bg-gray-700 h-1 rounded-full mx-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[0, 25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handlePercentageChange(percent)}
                  className="flex-1 py-1.5 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Info */}
      <div className="mt-4 mb-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">
            {t('coins.tradingForm.available')}
          </span>
          <span className="text-white">
            {availableBalance.toFixed(2)} USDT
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">
            {t('coins.tradingForm.volume')}
          </span>
          <span className="text-white">
            {(() => {
              const p = effectivePrice();
              const q = parseFloat(quantity);
              if (!p || !q) return '0 USDT';
              return `${(p * q).toFixed(2)} USDT`;
            })()}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-semibold py-3 rounded-full transition ${
          isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? t('coins.tradingForm.submitting') || 'Submitting...' : t('coins.tradingForm.confirm')}
      </button>
    </div>
  );
}
