import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function NoMoreSection() {
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-900 px-4 py-6 text-center">
      <p className="text-gray-400 text-sm">
        {t('finance.common.noMore')}
      </p>
    </div>
  );
}
