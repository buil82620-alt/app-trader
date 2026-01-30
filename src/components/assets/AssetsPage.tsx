import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import AssetsHeader from './AssetsHeader';
import AssetsTabs from './AssetsTabs';
import CoinsAccountList from './CoinsAccountList';
import ContractAccountList from './ContractAccountList';
import FuturesAccountList from './FuturesAccountList';
import ForexAccountList from './ForexAccountList';

type AccountType = 'coins' | 'contract' | 'futures' | 'forex';

export default function AssetsPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);
  const { t } = useAppTranslation();
  const [activeTab, setActiveTab] = useState<AccountType>('coins');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const handleBack = () => {
    window.history.back();
  };

  const renderAccountList = () => {
    switch (activeTab) {
      case 'coins':
        return <CoinsAccountList token={token} isVisible={isVisible} />;
      case 'contract':
        return <ContractAccountList token={token} isVisible={isVisible} />;
      case 'futures':
        return <FuturesAccountList token={token} isVisible={isVisible} />;
      case 'forex':
        return <ForexAccountList token={token} isVisible={isVisible} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-md mx-auto min-h-screen bg-[#14181d]">
        <AssetsHeader
          title={t('assets.headerTitle')}
          onBack={handleBack}
          onToggleVisibility={() => setIsVisible(!isVisible)}
          isVisible={isVisible}
        />

        <AssetsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {renderAccountList()}
      </div>
    </div>
  );
}

