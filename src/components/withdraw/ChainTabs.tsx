export type ChainKey = 'ERC20' | 'TRC20';

import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Props {
  value: ChainKey;
  onChange: (v: ChainKey) => void;
}

export default function ChainTabs({ value, onChange }: Props) {
  const { t } = useAppTranslation();

  return (
    <div className="flex items-center gap-8">
      <button
        type="button"
        onClick={() => onChange('ERC20')}
        className="relative py-2"
      >
        <span
          className={`text-lg ${
            value === 'ERC20' ? 'text-lime-400' : 'text-gray-400'
          }`}
        >
          {t('withdraw.chainTabs.erc20')}
        </span>
        {value === 'ERC20' && (
          <span className="absolute left-0 -bottom-1 h-1 w-14 rounded-full bg-lime-400" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('TRC20')}
        className="relative py-2"
      >
        <span
          className={`text-lg ${
            value === 'TRC20' ? 'text-lime-400' : 'text-gray-400'
          }`}
        >
          {t('withdraw.chainTabs.trc20')}
        </span>
        {value === 'TRC20' && (
          <span className="absolute left-0 -bottom-1 h-1 w-14 rounded-full bg-lime-400" />
        )}
      </button>
    </div>
  );
}


