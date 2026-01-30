import { useEffect, useRef, useState } from 'react';
import { useContractStore } from '../../stores/contractStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import ContractHeader from './ContractHeader';
import ContractSideMenu from './ContractSideMenu';
import PriceSection from './PriceSection';
import StatisticsSection from './StatisticsSection';
import TimeframeSelector from './TimeframeSelector';
import CandlestickChart from './CandlestickChart';
import AccountFunds from './AccountFunds';
import TradingModal from './TradingModal';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ContractPage() {
  const {
    symbol,
    price,
    changePercent,
    high,
    low,
    volume24h,
    timeframe,
    candlestickData,
    isLoading,
    setTimeframe,
    fetchInitialData,
    subscribeRealtime,
  } = useContractStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [tradingType, setTradingType] = useState<'buy-up' | 'buy-down'>('buy-up');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useAppTranslation();

  const cleanupRef = useRef<(() => void) | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // Subscribe to realtime updates
    cleanupRef.current = subscribeRealtime();

    isInitialMount.current = false;

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Refetch when timeframe changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;

    const refetch = async () => {
      await fetchInitialData();
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = subscribeRealtime();
    };
    refetch();
  }, [timeframe]);

  // Refetch when symbol changes (menu selection)
  useEffect(() => {
    if (isInitialMount.current) return;

    const refetch = async () => {
      await fetchInitialData();
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = subscribeRealtime();
    };
    refetch();
  }, [symbol]);

  const handleRefresh = () => {
    fetchInitialData();
  };

  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
  };

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
      <ContractHeader
        symbol={displaySymbol}
        changePercent={changePercent}
        onRefresh={handleRefresh}
        onOpenMenu={() => setIsMenuOpen(true)}
      />
      <ContractSideMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Price + statistics row */}
      <div className="px-4 pt-3 pb-2 bg-gray-900">
        <div className="flex items-start justify-between">
          <PriceSection price={price} changePercent={changePercent} />
          <StatisticsSection high={high} low={low} volume24h={volume24h} />
        </div>
      </div>

      <TimeframeSelector selected={timeframe} onSelect={handleTimeframeChange} />

      <CandlestickChart data={candlestickData} currentPrice={price} timeframe={timeframe} />

      {isLoggedIn ? (
        <AccountFunds
          currentPrice={price}
          symbol={symbol}
          onOpenBuyUp={() => {
            setTradingType('buy-up');
            setTradingModalOpen(true);
          }}
          onOpenBuyDown={() => {
            setTradingType('buy-down');
            setTradingModalOpen(true);
          }}
        />
      ) : (
        <div className="px-4 py-4">
          <a
            href="/login"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-lg transition block text-center"
          >
            {t('contract.goToLogin')}
          </a>
        </div>
      )}

      <TradingModal
        open={tradingModalOpen}
        onClose={() => setTradingModalOpen(false)}
        type={tradingType}
        symbol={displaySymbol}
        currentPrice={price}
      />
    </div>
  );
}
