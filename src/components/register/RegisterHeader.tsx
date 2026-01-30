import { useAppTranslation } from '../../hooks/useAppTranslation';
import LoginHeader from '../login/LoginHeader';

export default function RegisterHeader() {
  const { t } = useAppTranslation();

  return (
    <header className="pt-8 px-4 pb-6">
      <LoginHeader />
      <h1 className="text-lg font-semibold text-white">
        {t('register.headerTitle')}
      </h1>
    </header>
  );
}

