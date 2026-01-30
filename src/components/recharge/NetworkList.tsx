import NetworkItem from './NetworkItem';
import { useAppTranslation } from '../../hooks/useAppTranslation';

const NETWORKS = [
  { id: 'usdc-erc20', key: 'usdcErc20', color: '#2775CA' },
  { id: 'usdt-trc20', key: 'usdtTrc20', color: '#26A17B' },
  { id: 'usdt-erc20', key: 'usdtErc20', color: '#26A17B' },
  { id: 'eth-erc20', key: 'ethErc20', color: '#627EEA' },
  { id: 'btc-bitcoin', key: 'btcBitcoin', color: '#F7931A' },
];

interface NetworkListProps {
  onSelect: (networkId: string) => void;
}

export default function NetworkList({ onSelect }: NetworkListProps) {
  const { t } = useAppTranslation();

  return (
    <div className="px-4 pt-4 pb-8 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 rounded-3xl px-4 pt-4 pb-2 mb-4">
        <p className="text-white text-base mb-4">
          {t('rechargePage.networks.chooseNetwork')}
        </p>

        {NETWORKS.map((net, index) => {
          const label = t(
            `rechargePage.networkLabels.${net.key}` as any
          );
          return (
            <div
              key={net.id}
              className={
                index !== NETWORKS.length - 1
                  ? 'border-b border-gray-700'
                  : ''
              }
            >
              <NetworkItem
                label={label}
                onClick={() => onSelect(net.id)}
                icon={
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: net.color }}
                  >
                    {label.split('-')[0].charAt(0)}
                  </div>
                }
              />
            </div>
          );
        })}
      </div>

      <div className="bg-gray-800 rounded-3xl px-4 py-4">
        <button
          type="button"
          className="w-full flex items-center justify-between"
          onClick={() => onSelect('bank-card')}
        >
          <span className="text-white text-base">
            {t('rechargePage.networks.bankCardRecharge')}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}


