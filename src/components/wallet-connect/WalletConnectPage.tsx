import WalletConnectHeader from './WalletConnectHeader';
import WalletIllustration from './WalletIllustration';
import WalletList from './WalletList';
import { useAppTranslation } from '../../hooks/useAppTranslation';

// Wallet configurations with icon URLs
const WALLETS = [
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: 'https://altcoinsbox.com/wp-content/uploads/2023/03/coinbase-wallet-logo.png',
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    id: 'imtoken',
    name: 'imToken',
    icon: 'https://token.im/static/images/logo.svg',
  },
  {
    id: 'trustwallet',
    name: 'TrustWallet',
    icon: 'https://trustwallet.com/assets/images/media/assets/TWT.png',
  },
];

export default function WalletConnectPage() {
  const { t } = useAppTranslation();

  const handleWalletConnect = async (walletId: string) => {
    try {
      // Here you can integrate with actual wallet connection libraries
      // For example: Web3Modal, WalletConnect, etc.
      
      // For now, we'll just store the connection status
      const wallet = WALLETS.find((w) => w.id === walletId);
      if (wallet) {
        // Store connected wallet info (you can use localStorage or send to API)
        localStorage.setItem('connectedWallet', JSON.stringify({
          id: walletId,
          name: wallet.name,
          connectedAt: new Date().toISOString(),
        }));

        // Show success message
        alert(t('walletConnect.connectSuccess', { wallet: wallet.name }));
        
        // Optionally redirect or update UI
        // window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert(t('walletConnect.connectError'));
    }
  };

  return (
    <div className="min-h-screen bg-[#14181d] text-white">
      <WalletConnectHeader />
      
      {/* Illustration Section */}
      <WalletIllustration />
      
      {/* Wallet List Section */}
      <WalletList wallets={WALLETS} onWalletConnect={handleWalletConnect} />
    </div>
  );
}

