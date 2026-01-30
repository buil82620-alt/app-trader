import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import LoadingSpinner from '../shared/LoadingSpinner';

interface Props {
  accountType: string;
  asset: string;
}

export default function AssetDetailPage({ accountType, asset }: Props) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);
  const { t } = useAppTranslation();
  const [balance, setBalance] = useState<{
    asset: string;
    available: number;
    locked: number;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!token || !accountType || !asset) {
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const res = await fetch(
          `/api/assets/detail?accountType=${encodeURIComponent(accountType)}&asset=${encodeURIComponent(asset)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBalance(data.balance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch asset detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [token, accountType, asset]);

  const handleBack = () => {
    window.history.back();
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(8);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-md mx-auto min-h-screen bg-[#14181d]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#14181d]/95 backdrop-blur">
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

            <div className="flex-1 text-center text-white text-xl font-semibold tracking-wide">
              {accountType === 'coins' && t('assets.tabs.coinsAccount')}
              {accountType === 'contract' && t('assets.tabs.contractAccount')}
              {accountType === 'futures' && t('assets.tabs.futuresAccount')}
              {accountType === 'forex' && t('assets.tabs.forexAccount')}
            </div>

            <div className="w-9 h-9" />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-24">
          {balance ? (
            <>
              {/* Asset Name */}
              <div className="text-2xl font-semibold text-white mb-6">{balance.asset}</div>

              {/* Balance Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">{t('assets.detail.available')}</span>
                  <span className="text-white text-lg">{formatAmount(balance.available)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">{t('assets.detail.freeze')}</span>
                  <span className="text-white text-lg">{formatAmount(balance.locked)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">{t('assets.detail.converted')}</span>
                  <span className="text-white text-lg">
                    {formatAmount(balance.asset === 'USDT' ? balance.total : balance.total * 1)}
                  </span>
                </div>
              </div>

              {/* Financial Records */}
              <div className="mt-8">
                <div className="text-lg font-medium text-white mb-4">
                  {t('assets.detail.financialRecords')}
                </div>
                <div className="pt-6 text-center text-gray-500">
                  {t('assets.detail.noMore')}
                </div>
              </div>
            </>
          ) : (
            <div className="pt-8 text-center text-gray-400">
              Asset not found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

