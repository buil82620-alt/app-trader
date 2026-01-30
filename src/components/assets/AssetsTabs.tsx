import { useAppTranslation } from '../../hooks/useAppTranslation';

type AccountType = 'coins' | 'contract' | 'futures' | 'forex';

interface Props {
  activeTab: AccountType;
  onTabChange: (tab: AccountType) => void;
}

export default function AssetsTabs({ activeTab, onTabChange }: Props) {
  const { t } = useAppTranslation();

  const tabs: { key: AccountType; label: string }[] = [
    { key: 'coins', label: t('assets.tabs.coinsAccount') },
    { key: 'contract', label: t('assets.tabs.contractAccount') },
    { key: 'futures', label: t('assets.tabs.futuresAccount') },
    { key: 'forex', label: t('assets.tabs.forexAccount') },
  ];

  return (
    <div className="flex items-center justify-around border-b border-white/10 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className="relative py-3 px-2"
        >
          <span
            className={`text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-emerald-400'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
          </span>
          {activeTab === tab.key && (
            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

