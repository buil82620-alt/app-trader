import { useAppTranslation } from '../../hooks/useAppTranslation';

interface WalletItemProps {
  name: string;
  icon: string;
  onConnect: () => void;
  isConnecting?: boolean;
}

export default function WalletItem({ name, icon, onConnect, isConnecting = false }: WalletItemProps) {
  const { t } = useAppTranslation();

  return (
    <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform">
      {/* Wallet Icon */}
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
        <img
          src={icon}
          alt={name}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to a default icon if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-gray-600 font-bold text-lg">${name.charAt(0)}</span>
                </div>
              `;
            }
          }}
        />
      </div>

      {/* Wallet Name */}
      <div className="flex-1">
        <span className="text-gray-900 font-medium text-base">{name}</span>
      </div>

      {/* Connect Button */}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="px-4 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed lowercase"
      >
        {isConnecting ? t('walletConnect.connecting') : t('walletConnect.connect')}
      </button>
    </div>
  );
}

