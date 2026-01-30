import { useAppTranslation } from '../../hooks/useAppTranslation';

interface StatisticsSectionProps {
  high: number;
  low: number;
  volume24h: number;
}

export default function StatisticsSection({ high, low, volume24h }: StatisticsSectionProps) {
  const { t } = useAppTranslation();

  return (
    <div>
      <div className="space-y-1 text-right">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {t('contract.statistics.high')}
          </span>
          <span className="text-white">
            {high.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {t('contract.statistics.low')}
          </span>
          <span className="text-white">
            {low.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {t('contract.statistics.volume24h')}
          </span>
          <span className="text-white">
            {volume24h.toLocaleString('en-US', {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
