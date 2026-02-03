import { useEffect, useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ContractPosition {
  id: number;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice: number | null;
  amount: number;
  duration: number;
  profitability: number;
  expectedProfit: number;
  expectedPayout: number;
  actualProfit: number | null;
  status: string;
  result: string | null;
  createdAt: string;
  expiresAt: string;
  closedAt: string | null;
}

export default function ContractDetailPage() {
  const [position, setPosition] = useState<ContractPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const { t } = useAppTranslation();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const idParam = search.get('id');
    if (!idParam) {
      setError('Missing position id');
      setIsLoading(false);
      return;
    }

    const positionId = Number(idParam);
    if (!Number.isFinite(positionId)) {
      setError('Invalid position id');
      setIsLoading(false);
      return;
    }

    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy cả OPEN và CLOSED rồi tìm theo id
        const [openRes, closedRes] = await Promise.all([
          fetch('/api/contract/positions?status=OPEN&limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/contract/positions?status=CLOSED&limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const openData = await openRes.json();
        const closedData = await closedRes.json();

        const all: ContractPosition[] = [
          ...(openData.success ? openData.positions : []),
          ...(closedData.success ? closedData.positions : []),
        ];

        const found = all.find((p) => p.id === positionId) ?? null;
        if (!found) {
          setError('Position not found');
        }
        setPosition(found);
      } catch (err) {
        console.error('Fetch contract position detail error:', err);
        setError('Failed to load position detail');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [token]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/contract';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-200">
        <div className="mb-4 text-sm">{error || 'Position not found'}</div>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-gray-900 text-sm font-semibold"
        >
          {t('contract.goToLogin')}
        </button>
      </div>
    );
  }

  const displaySymbol = position.symbol.replace('USDT', '/USDT');
  const isBuyUp = position.side === 'BUY_UP';
  const isWin = position.result === 'WIN';
  const statusLabel =
    position.status === 'OPEN'
      ? 'In transaction'
      : position.status === 'CLOSED'
      ? 'Closed'
      : position.status;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10 transition"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="flex-1 text-center text-base font-semibold">{displaySymbol}</div>
          <div className="w-9 h-9" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Status + side */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            {statusLabel}
          </div>
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isBuyUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {isBuyUp ? t('contract.tradingModal.buy') : t('contract.tradingModal.sell')}
          </div>
        </div>

        {/* Main numbers */}
        <div className="mb-4 p-4 rounded-2xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
            <span>Amount</span>
            <span className="text-white">{position.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
            <span>Entry price</span>
            <span className="text-white">{position.entryPrice.toFixed(2)}</span>
          </div>
          {position.exitPrice !== null && (
            <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
              <span>Exit price</span>
              <span className="text-white">{position.exitPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
            <span>Duration</span>
            <span className="text-white">{position.duration}s</span>
          </div>
          <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
            <span>Profitability</span>
            <span className="text-emerald-400">{position.profitability}%</span>
          </div>
          <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
            <span>Expected profit</span>
            <span className="text-white">{position.expectedProfit.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Expected payout</span>
            <span className="text-white">{position.expectedPayout.toFixed(2)}</span>
          </div>
        </div>

        {/* Result section for closed positions */}
        {position.status === 'CLOSED' && (
          <div className="mb-4 p-4 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
              <span>Result</span>
              <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
                {isWin ? 'WIN' : position.result || 'LOSS'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Actual profit</span>
              <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
                {position.actualProfit !== null ? position.actualProfit.toFixed(2) : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Time info */}
        <div className="mb-4 p-4 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Created at</span>
            <span>{new Date(position.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Expires at</span>
            <span>{new Date(position.expiresAt).toLocaleString()}</span>
          </div>
          {position.closedAt && (
            <div className="flex items-center justify-between">
              <span>Closed at</span>
              <span>{new Date(position.closedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


