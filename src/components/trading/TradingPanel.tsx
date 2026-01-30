import { useState } from 'react';
import { useTradingStore } from '../stores/tradingStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function TradingPanel() {
  const { t } = useAppTranslation();
  const {
    balance,
    selectedSymbol,
    addOrder,
    addPosition,
    setBalance,
  } = useTradingStore();

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');

  const handlePlaceOrder = () => {
    const qty = parseFloat(quantity);
    const orderPrice = parseFloat(price);

    if (!qty || !orderPrice || qty <= 0 || orderPrice <= 0) {
      alert(t('trading.panel.errors.invalidQuantityPrice'));
      return;
    }

    const totalCost = qty * orderPrice;
    if (orderType === 'buy' && totalCost > balance) {
      alert(t('trading.panel.errors.insufficientBalance'));
      return;
    }

    // Create order
    const order = {
      id: `order-${Date.now()}`,
      symbol: selectedSymbol,
      type: orderType,
      quantity: qty,
      price: orderPrice,
      status: 'filled' as const,
      timestamp: new Date(),
    };

    addOrder(order);

    // Update balance
    if (orderType === 'buy') {
      setBalance(balance - totalCost);
    } else {
      setBalance(balance + totalCost);
    }

    // Create position if buying
    if (orderType === 'buy') {
      const position = {
        id: `pos-${Date.now()}`,
        symbol: selectedSymbol,
        type: positionType,
        quantity: qty,
        entryPrice: orderPrice,
        currentPrice: orderPrice,
        pnl: 0,
        pnlPercent: 0,
      };
      addPosition(position);
    }

    // Reset form
    setQuantity('');
    setPrice('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        {t('trading.panel.title')}
      </h2>
      
      <div className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('trading.panel.orderTypeLabel')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                orderType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('trading.panel.buy')}
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                orderType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('trading.panel.sell')}
            </button>
          </div>
        </div>

        {/* Position Type (only for buy orders) */}
        {orderType === 'buy' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('trading.panel.positionTypeLabel')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPositionType('long')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  positionType === 'long'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('trading.panel.long')}
              </button>
              <button
                onClick={() => setPositionType('short')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  positionType === 'short'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('trading.panel.short')}
              </button>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('trading.panel.quantityLabel')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('trading.panel.quantityPlaceholder')}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('trading.panel.priceLabel')}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Total */}
        {quantity && price && (
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">
              {t('trading.panel.totalLabel')}
            </p>
            <p className="text-lg font-bold">
              ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
            </p>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${
            orderType === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {t('trading.panel.placeOrderButton', {
            side: orderType.toUpperCase(),
          })}
        </button>
      </div>
    </div>
  );
}
