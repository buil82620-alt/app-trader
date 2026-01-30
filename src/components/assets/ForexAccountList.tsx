import { useEffect, useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import AssetItem from './AssetItem';
import LoadingSpinner from '../shared/LoadingSpinner';

interface Props {
  token: string | null;
  isVisible: boolean;
}

interface AssetBalance {
  asset: string;
  available: number;
  locked: number;
  total: number;
}

export default function ForexAccountList({ token, isVisible }: Props) {
  const { t } = useAppTranslation();
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsdt, setTotalUsdt] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        const res = await fetch('/api/assets/forex', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBalances(data.balances || []);
            setTotalUsdt(data.balances?.[0]?.total || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch forex balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [token]);

  const handleAssetClick = (asset: string) => {
    window.location.href = `/assets/detail?accountType=forex&asset=${encodeURIComponent(asset)}`;
  };

  const formatAmount = (amount: number) => {
    if (!isVisible) return '****';
    return amount.toFixed(10);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 py-4">
        <div className="text-lg font-medium text-white mb-3">
          {t('assets.tabs.forexAccount')}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {t('assets.totalAssets')}
          </span>
          <span className="text-xs text-gray-300">
            {formatAmount(totalUsdt)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {balances.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            No assets
          </div>
        ) : (
          balances.map((balance) => (
            <AssetItem
              key={balance.asset}
              balance={balance}
              isVisible={isVisible}
              accountType="forex"
              onClick={() => handleAssetClick(balance.asset)}
            />
          ))
        )}
      </div>
    </div>
  );
}

