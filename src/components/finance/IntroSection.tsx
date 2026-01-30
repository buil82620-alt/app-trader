import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function IntroSection() {
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-900 px-4 py-4">
      <p className="text-white text-sm leading-relaxed">
        {t('finance.intro')}
      </p>
    </div>
  );
}
