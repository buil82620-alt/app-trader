import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function VerifyHeader() {
  const { t } = useAppTranslation();

  return (
    <header className="px-4 pt-6 pb-4 bg-gray-900">
      <p className="text-sm text-gray-300">
        {t('verify.header.subtitle')}
      </p>
    </header>
  );
}


