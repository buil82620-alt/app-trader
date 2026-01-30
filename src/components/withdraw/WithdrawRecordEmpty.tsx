import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function WithdrawRecordEmpty() {
  const { t } = useAppTranslation();

  return (
    <div className="pt-6 text-center text-gray-500">
      {t('withdraw.common.noMore')}
    </div>
  );
}


