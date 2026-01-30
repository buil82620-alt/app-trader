import { useEffect, useRef, useState } from 'react';
import { useCoinsStore } from '../../stores/coinsStore';
import CoinsHeader from './CoinsHeader';
import OrderBook from './OrderBook';
import TradingForm from './TradingForm';
import CoinSideMenu from './CoinSideMenu';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function CoinsPage() {
  const {
    symbol,
    price,
    changePercent,
    bids,
    asks,
    availableBalance,
    isLoading,
    fetchInitialData,
    subscribeRealtime,
  } = useCoinsStore();

  const searchParams = new URLSearchParams(window.location.search);
  const symbolParam = searchParams.get('symbol');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (symbolParam) {
      useCoinsStore.getState().setSymbol(symbolParam);
    }
  }, [symbolParam]);

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // Subscribe to realtime updates
    cleanupRef.current = subscribeRealtime();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []); // Only run once on mount

  // Format symbol for display (BTCUSDT -> BTC/USDT)
  const displaySymbol = symbol.replace('USDT', '/USDT');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen pb-20">
      <CoinsHeader
        symbol={displaySymbol}
        price={price}
        changePercent={changePercent}
        onOpenMenu={() => setIsMenuOpen(true)}
      />
      <CoinSideMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <OrderBook bids={bids} asks={asks} />
      <TradingForm currentPrice={price} availableBalance={availableBalance} />
    </div>
  );
}
