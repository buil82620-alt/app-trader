import { useAppTranslation } from '../../hooks/useAppTranslation';

export type OrderTabKey = 'in_transaction' | 'position_closed';

interface Props {
  value: OrderTabKey;
  onChange: (value: OrderTabKey) => void;
}

export default function OrderTabs({ value, onChange }: Props) {
  const isInTx = value === 'in_transaction';
  const { t } = useAppTranslation();

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => onChange('in_transaction')}
        className="relative py-3 text-left"
      >
        <span className={`text-base ${isInTx ? 'text-lime-400' : 'text-gray-400'}`}>
          {t('order.tabs.inTransaction')}
        </span>
        {isInTx && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-10 rounded-full bg-lime-400" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('position_closed')}
        className="relative py-3 text-left"
      >
        <span className={`text-base ${!isInTx ? 'text-lime-400' : 'text-gray-400'}`}>
          {t('order.tabs.positionClosed')}
        </span>
        {!isInTx && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-10 rounded-full bg-lime-400" />
        )}
      </button>
    </div>
  );
}


