import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useAppTranslation } from '../../../hooks/useAppTranslation';
import SecurityHeader from './SecurityHeader';
import SecurityMenu from './SecurityMenu';
import ResetPasswordForm from './ResetPasswordForm';

type View = 'menu' | 'reset';

export default function SecurityCenterPage() {
  const { isLoggedIn } = useAuthStore();
  const [view, setView] = useState<View>('menu');
  const [resetType, setResetType] = useState<'login' | 'transaction'>('login');
  const { t } = useAppTranslation();

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-[#14181d] text-white">
        <SecurityHeader
          title={t('profile.securityCenter')}
          onBack={() => window.history.back()}
        />
        <SecurityMenu
          onSelect={(type) => {
            setResetType(type);
            setView('reset');
          }}
        />
      </div>
    );
  }

  const title =
    resetType === 'login'
      ? t('profile.security.loginPassword')
      : t('profile.security.transactionPassword');

  return (
    <div className="min-h-screen bg-[#14181d] text-white">
      <SecurityHeader
        title={title}
        onBack={() => setView('menu')}
      />
      <ResetPasswordForm
        type={resetType}
        onSuccess={() => setView('menu')}
      />
    </div>
  );
}


