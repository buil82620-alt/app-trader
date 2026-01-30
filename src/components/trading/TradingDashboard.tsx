import { useTradingStore, Position, Order } from '../stores/tradingStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function TradingDashboard() {
  const { t } = useAppTranslation();
  const {
    balance,
    positions,
    orders,
    selectedSymbol,
    setSelectedSymbol,
    calculateTotalPnl,
  } = useTradingStore();

  const totalPnl = calculateTotalPnl();
  const totalValue = balance + totalPnl;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {t('trading.dashboard.title')}
        </h1>

        {/* Balance & PnL Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              {t('trading.dashboard.summary.balance')}
            </p>
            <p className="text-2xl font-bold">${balance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              {t('trading.dashboard.summary.totalPnl')}
            </p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalPnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              {t('trading.dashboard.summary.totalValue')}
            </p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Symbol Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {t('trading.dashboard.symbolSelectorLabel')}
          </label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="BNB/USDT">BNB/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
        </div>

        {/* Positions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {t('trading.dashboard.positions.title')}
          </h2>
          {positions.length === 0 ? (
            <p className="text-gray-400">
              {t('trading.dashboard.positions.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.symbol')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.type')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.quantity')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.entryPrice')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.currentPrice')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.pnl')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.positions.headers.pnlPercent')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id} className="border-b border-gray-700">
                      <td className="p-2">{position.symbol}</td>
                      <td className={`p-2 ${position.type === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                        {position.type.toUpperCase()}
                      </td>
                      <td className="p-2">{position.quantity}</td>
                      <td className="p-2">${position.entryPrice.toFixed(2)}</td>
                      <td className="p-2">${position.currentPrice.toFixed(2)}</td>
                      <td className={`p-2 ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${position.pnl.toFixed(2)}
                      </td>
                      <td className={`p-2 ${position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.pnlPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            {t('trading.dashboard.orders.title')}
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-400">
              {t('trading.dashboard.orders.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.symbol')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.type')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.quantity')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.price')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.status')}
                    </th>
                    <th className="text-left p-2">
                      {t('trading.dashboard.orders.headers.time')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b border-gray-700">
                      <td className="p-2">{order.symbol}</td>
                      <td className={`p-2 ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {order.type.toUpperCase()}
                      </td>
                      <td className="p-2">{order.quantity}</td>
                      <td className="p-2">${order.price.toFixed(2)}</td>
                      <td className={`p-2 ${
                        order.status === 'filled' ? 'text-green-500' :
                        order.status === 'pending' ? 'text-yellow-500' :
                        'text-gray-500'
                      }`}>
                        {order.status.toUpperCase()}
                      </td>
                      <td className="p-2 text-sm text-gray-400">
                        {order.timestamp.toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
