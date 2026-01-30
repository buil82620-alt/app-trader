import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Order {
  price: number;
  quantity: number;
}

interface OrderBookProps {
  bids: Order[];
  asks: Order[];
}

export default function OrderBook({ bids, asks }: OrderBookProps) {
  const { t } = useAppTranslation();
  const allQuantities = [...bids, ...asks].map((o) => o.quantity);
  const maxQuantity = allQuantities.length > 0 ? Math.max(...allQuantities) : 1;

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(6);
  };

  // Build rows pairing asks (from best price descending) and bids
  const maxRows = 5;
  const askSlice = asks.slice(0, maxRows).reverse();
  const bidSlice = bids.slice(0, maxRows);
  const rows = Array.from({ length: maxRows }).map((_, idx) => ({
    ask: askSlice[idx],
    bid: bidSlice[idx],
  }));

  return (
    <div className="bg-gray-900 px-4 py-4">
      {/* Column Headers */}
      <div className="grid grid-cols-4 text-xs text-gray-400 mb-2">
        <div className="text-left col-span-1">{t('coins.orderBook.price')}</div>
        <div className="text-center col-span-2">{t('coins.orderBook.quantity')}</div>
        <div className="text-right col-span-1">{t('coins.orderBook.price')}</div>
      </div>

      {/* Combined Asks & Bids rows */}
      <div className="space-y-0.5">
        {rows.map((row, index) => {
          const askWidth =
            row.ask && maxQuantity > 0 ? (row.ask.quantity / maxQuantity) * 50 : 0;
          const bidWidth =
            row.bid && maxQuantity > 0 ? (row.bid.quantity / maxQuantity) * 50 : 0;

          return (
            <div key={index} className="relative h-6 overflow-hidden">
              {/* Ask background (left, red) */}
              {row.ask && (
                <div
                  className="absolute left-0 top-0 h-full bg-red-600/60 transition-all duration-300"
                  style={{ width: `${askWidth}%` }}
                />
              )}

              {/* Bid background (right, green) */}
              {row.bid && (
                <div
                  className="absolute right-0 top-0 h-full bg-emerald-600/60 transition-all duration-300"
                  style={{ width: `${bidWidth}%` }}
                />
              )}

              {/* Content */}
              <div className="relative grid grid-cols-4 h-full text-sm items-center">
                <div className="text-red-400 pl-1">
                  {row.ask ? formatPrice(row.ask.price) : ''}
                </div>
                <div className="text-gray-300 text-right pr-1">
                  {row.ask ? formatQuantity(row.ask.quantity) : ''}
                </div>
                <div className="text-gray-300 text-left pl-1">
                  {row.bid ? formatQuantity(row.bid.quantity) : ''}
                </div>
                <div className="text-emerald-400 text-right pr-1">
                  {row.bid ? formatPrice(row.bid.price) : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
