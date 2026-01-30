import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function OrderEmpty() {
  const { t } = useAppTranslation();

  return (
    <div className="pt-10 text-center">
      <div className="text-gray-500 text-base">
        {t('order.empty')}
      </div>
    </div>
  );
}


