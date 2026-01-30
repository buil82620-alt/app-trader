import { useState } from 'react';
import RechargeHeader from './RechargeHeader';
import NetworkList from './NetworkList';
import RechargeForm from './RechargeForm';
import BankCardModal from './BankCardModal';
import { useAppTranslation } from '../../hooks/useAppTranslation';

type View = 'list' | 'deposit';

export default function RechargePage() {
  const { t } = useAppTranslation();
  const [view, setView] = useState<View>('list');
  const [selectedNetworkLabel, setSelectedNetworkLabel] = useState('USDC-ERC20');
  const [showBankModal, setShowBankModal] = useState(false);

  const handleSelectNetwork = (networkId: string) => {
    if (networkId === 'bank-card') {
      setShowBankModal(true);
      return;
    }

    const labelMap: Record<string, string> = {
      'usdc-erc20': 'USDC-ERC20',
      'usdt-trc20': 'USDT-TRC20',
      'usdt-erc20': 'USDT-ERC20',
      'eth-erc20': 'ETH-ERC20',
      'btc-bitcoin': 'BTC-Bitcoin',
      'bank-card': 'Bank Card Recharge',
    };
    setSelectedNetworkLabel(labelMap[networkId] ?? 'USDC-ERC20');
    setView('deposit');
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <RechargeHeader title={t('rechargePage.header.listTitle')} />
        <NetworkList onSelect={handleSelectNetwork} />
        <BankCardModal open={showBankModal} onClose={() => setShowBankModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <RechargeHeader
        title={t('rechargePage.header.depositTitle')}
        onBack={() => setView('list')}
      />
      <RechargeForm networkLabel={selectedNetworkLabel} />
    </div>
  );
}


