import { useAppTranslation } from '../../hooks/useAppTranslation';

interface ContractHeaderProps {
  symbol: string;
  changePercent: number;
  onRefresh?: () => void;
  onOpenMenu?: () => void;
}

export default function ContractHeader({
  symbol,
  changePercent,
  onRefresh,
  onOpenMenu,
}: ContractHeaderProps) {
  const isPositive = changePercent >= 0;
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-900 border-b border-gray-700">
      {/* Top Title Row */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-green-500 font-medium text-sm">
          {t('contract.headerTitle')}
        </h1>
        <button
          onClick={onRefresh}
          className="p-2 active:bg-gray-800 rounded-lg transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Symbol and Change Row */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <button
          className="p-2 active:bg-gray-800 rounded-lg transition"
          onClick={onOpenMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{symbol}</span>
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-sm">{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            {isPositive ? (
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        <a href="/order" className="p-2 active:bg-gray-800 rounded-lg transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
