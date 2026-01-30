import { useState } from 'react';
import WalletItem from './WalletItem';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

interface WalletListProps {
  wallets: Wallet[];
  onWalletConnect?: (walletId: string) => void;
}

export default function WalletList({ wallets, onWalletConnect }: WalletListProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const { t } = useAppTranslation();

  const handleConnect = async (walletId: string) => {
    setConnectingId(walletId);
    
    try {
      // Simulate wallet connection process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Call the callback if provided
      if (onWalletConnect) {
        onWalletConnect(walletId);
      } else {
        // Default behavior: show success message
        alert(t('walletConnect.connectSuccess', { wallet: wallets.find(w => w.id === walletId)?.name }));
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert(t('walletConnect.connectError'));
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="px-4 pb-8 space-y-3">
      {wallets.map((wallet) => (
        <WalletItem
          key={wallet.id}
          name={wallet.name}
          icon={wallet.icon}
          onConnect={() => handleConnect(wallet.id)}
          isConnecting={connectingId === wallet.id}
        />
      ))}
    </div>
  );
}

