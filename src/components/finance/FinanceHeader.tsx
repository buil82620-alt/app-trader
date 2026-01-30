import { useAppTranslation } from '../../hooks/useAppTranslation';

type Tab = 'ai-mining' | 'ieo-launchpad';

interface FinanceHeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function FinanceHeader({ activeTab, onTabChange }: FinanceHeaderProps) {
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="flex">
        <button
          onClick={() => onTabChange('ai-mining')}
          className={`flex-1 px-4 py-4 text-center font-medium transition relative ${
            activeTab === 'ai-mining'
              ? 'text-white'
              : 'text-gray-400'
          }`}
        >
          {t('finance.header.aiMining')}
          {activeTab === 'ai-mining' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></span>
          )}
        </button>
        <button
          onClick={() => onTabChange('ieo-launchpad')}
          className={`flex-1 px-4 py-4 text-center font-medium transition relative ${
            activeTab === 'ieo-launchpad'
              ? 'text-white'
              : 'text-gray-400'
          }`}
        >
          {t('finance.header.ieoLaunchpad')}
          {activeTab === 'ieo-launchpad' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></span>
          )}
        </button>
      </div>
    </div>
  );
}
