import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useAppTranslation } from '../../../hooks/useAppTranslation';

interface Props {
  type: 'login' | 'transaction';
  onSuccess: () => void;
}

export default function ResetPasswordForm({ type, onSuccess }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [hasTransactionPassword, setHasTransactionPassword] = useState<boolean | null>(null);
  const token = useAuthStore((s) => s.token);
  const { t } = useAppTranslation();

  // Check if user has transaction password when type is 'transaction'
  useEffect(() => {
    if (type === 'transaction' && token) {
      setCheckingPassword(true);
      fetch('/api/security/check-transaction-password', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setHasTransactionPassword(data.hasTransactionPassword || false);
        })
        .catch((err) => {
          console.error('Error checking transaction password:', err);
          setHasTransactionPassword(false);
        })
        .finally(() => {
          setCheckingPassword(false);
        });
    } else {
      setHasTransactionPassword(null);
    }
  }, [type, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // For transaction password, if user doesn't have one yet, oldPassword is optional (will use login password)
    const needsOldPassword = type === 'login' || (type === 'transaction' && hasTransactionPassword === true);
    
    if (needsOldPassword && !oldPassword) {
      setError(t('security.resetForm.errors.allRequired'));
      return;
    }
    
    if (!password || !confirmPassword) {
      setError(t('security.resetForm.errors.allRequired'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('security.resetForm.errors.minLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('security.resetForm.errors.notMatch'));
      return;
    }

    if (!token) {
      setError(t('security.resetForm.errors.notLoggedIn'));
      return;
    }
    
    // For setting transaction password for the first time, oldPassword should be the login password
    // The API will verify it against login password instead of transaction password
    const finalOldPassword = oldPassword;

    setLoading(true);
    try {
      const res = await fetch('/api/security/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          oldPassword: finalOldPassword,
          newPassword: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setError(
          (data && (data.error as string)) ||
            t('security.resetForm.errors.serverError'),
        );
        return;
      }

      alert(t('security.resetForm.success'));
      onSuccess();
    } catch (e) {
      console.error('Reset password error:', e);
      setError(t('security.resetForm.errors.network'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking transaction password status
  if (type === 'transaction' && checkingPassword) {
    return (
      <div className="px-4 pt-6 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-400">{t('security.resetForm.checking')}</div>
      </div>
    );
  }

  // Determine if we need to show old password field
  const showOldPassword = type === 'login' || (type === 'transaction' && hasTransactionPassword === true);
  const isSettingFirstTime = type === 'transaction' && hasTransactionPassword === false;

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6 ">
      {isSettingFirstTime && (
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400 text-sm">{t('security.resetForm.setFirstTimeNotice')}</p>
        </div>
      )}
      <div className="space-y-3 mb-10">
        {isSettingFirstTime ? (
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('security.resetForm.loginPasswordForVerification')}
            className="w-full h-12 rounded-full bg-[#3b4338] text-white/90 placeholder:text-gray-500 px-5 py-3.5 outline-none border border-transparent focus:border-emerald-400/50 transition-colors"
          />
        ) : showOldPassword ? (
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t(type === 'login' ? 'security.resetForm.oldLoginPasswordPlaceholder' : 'security.resetForm.oldTransactionPasswordPlaceholder')}
            className="w-full h-12 rounded-full bg-[#3b4338] text-white/90 placeholder:text-gray-500 px-5 py-3.5 outline-none border border-transparent focus:border-emerald-400/50 transition-colors"
          />
        ) : null}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t(type === 'login' ? 'security.resetForm.loginPasswordPlaceholder' : 'security.resetForm.transactionPasswordPlaceholder')}
          className="w-full h-12 rounded-full bg-[#3b4338] text-white/90 placeholder:text-gray-500 px-5 py-3.5 outline-none border border-transparent focus:border-emerald-400/50 transition-colors"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t(type === 'login' ? 'security.resetForm.confirmLoginPasswordPlaceholder' : 'security.resetForm.confirmTransactionPasswordPlaceholder')}
          className="w-full h-12 rounded-full bg-[#3b4338] text-white/90 placeholder:text-gray-500 px-5 py-3.5 outline-none border border-transparent focus:border-emerald-400/50 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3 px-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full h-12 bg-emerald-400 text-gray-900 font-semibold py-3.5 mt-4 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-150 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
      >
        {loading
          ? t('security.resetForm.loading')
          : isSettingFirstTime
          ? t('security.resetForm.submitSetTransaction')
          : t(
              type === 'login'
                ? 'security.resetForm.submitLogin'
                : 'security.resetForm.submitTransaction',
            )}
      </button>
    </form>
  );
}


