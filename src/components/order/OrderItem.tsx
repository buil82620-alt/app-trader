import { useAppTranslation } from '../../hooks/useAppTranslation';

export type OrderStatus = 'in_transaction' | 'position_closed';

export interface OrderRecord {
  id: string;
  type: 'spot' | 'contract';
  symbol: string;
  side: 'BUY' | 'SELL';
  status: OrderStatus;
  amount: number;
  createdAt: string; // ISO or display string
  // Spot order fields
  price?: number | null;
  quantity?: number;
  filledQuantity?: number;
  orderType?: string;
  orderStatus?: string;
  // Contract position fields
  entryPrice?: number;
  exitPrice?: number | null;
  result?: string | null;
}

interface Props {
  order: OrderRecord;
}

export default function OrderItem({ order }: Props) {
  const { t } = useAppTranslation();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const displaySymbol = order.symbol.replace('USDT', '/USDT');
  const isContract = order.type === 'contract';
  const isWin = order.result === 'WIN';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-white font-semibold">{displaySymbol}</div>
          {isContract && (
            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
              Contract
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isContract && order.result && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {order.result}
            </span>
          )}
          <div className={`text-sm font-medium ${order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
            {order.side}
          </div>
        </div>
      </div>

      {isContract ? (
        <>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white">{order.amount.toFixed(2)} USDT</span>
          </div>
          {order.entryPrice && (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-400">Entry</span>
              <span className="text-white">{order.entryPrice.toFixed(2)}</span>
            </div>
          )}
          {order.exitPrice && (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-400">Exit</span>
              <span className="text-white">{order.exitPrice.toFixed(2)}</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">{t('order.item.amount')}</span>
            <span className="text-white">{order.amount.toFixed(2)}</span>
          </div>
          {order.price && (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="text-white">{order.price.toFixed(2)}</span>
            </div>
          )}
          {order.orderStatus && (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="text-white text-xs">{order.orderStatus}</span>
            </div>
          )}
        </>
      )}

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-400">{t('order.item.time')}</span>
        <span className="text-gray-300">{formatDate(order.createdAt)}</span>
      </div>
    </div>
  );
}


