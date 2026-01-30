import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import InputField from './InputField';
import CheckboxAndLink from './CheckboxAndLink';
import ActionButton from './ActionButton';
import { useMemo, useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

// Validation schema will use i18n messages

type LoginFormData = {
  account: string;
  password: string;
  rememberPassword?: boolean;
};

export default function LoginForm() {
  const { t } = useAppTranslation();

  const loginSchema = useMemo(
    () =>
      z.object({
        account: z
          .string()
          .min(1, t('login.form.errors.accountRequired')),
        password: z
          .string()
          .min(1, t('login.form.errors.passwordRequired')),
        rememberPassword: z.boolean().optional(),
      }),
    [t]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const login = useAuthStore((state) => state.login);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.account, password: data.password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(
          result.error || t('login.form.submitErrorDefault')
        );
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      login({ 
        userId: result.userId, 
        email: data.account, 
        token: result.token,
        isVerified: result.isVerified || false,
      });
      window.location.href = '/contract';
    } catch (e) {
      console.error('Login error:', e);
      setSubmitError(t('login.form.networkError'));
      setShowErrorModal(true);
      setIsLoading(false);
    }
  };

  const handleWalletLogin = () => {
    console.log('Wallet login clicked');
    window.location.href = '/wallet-connect';
    // Handle wallet login logic
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
    // Navigate to register page
    window.location.href = '/register';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4">
      <InputField
        label={t('login.form.accountLabel')}
        name="account"
        type="text"
        placeholder={t('login.form.accountPlaceholder')}
        register={register as any}
        error={errors.account}
      />

      <InputField
        label={t('login.form.passwordLabel')}
        name="password"
        type="password"
        placeholder={t('login.form.passwordPlaceholder')}
        register={register as any}
        error={errors.password}
        showPasswordToggle
      />

      <CheckboxAndLink register={register as any} />

      <div className="space-y-4">
        <ActionButton
          text={
            isLoading
              ? t('login.form.buttonLoggingIn')
              : t('login.form.buttonLogin')
          }
          type="submit"
          disabled={isLoading}
        />

        <div className="text-center">
          <span className="text-gray-400 text-sm">
            {t('login.form.orText')}
          </span>
        </div>

        <ActionButton
          text={t('login.form.buttonWalletLogin')}
          onClick={handleWalletLogin}
        />

        <div className="text-center">
          <span className="text-gray-400 text-sm">
            {t('login.form.orText')}
          </span>
        </div>

        <ActionButton
          text={t('login.form.buttonCreateAccount')}
          variant="secondary"
          onClick={handleCreateAccount}
        />
      </div>
      {showErrorModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative z-10 mx-8 max-w-sm w-full rounded-2xl bg-[#1f252b] px-6 py-5 shadow-xl border border-white/10 animate-slide-up">
            <div className="text-white font-semibold text-base mb-2 text-center">
              {t('login.form.errorModalTitle')}
            </div>
            <div className="text-gray-300 text-sm mb-5 text-center">
              {submitError || t('login.form.invalidCredentials')}
            </div>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="mx-auto flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.7)] active:translate-y-[1px] transition"
            >
              {t('login.form.errorModalButton')}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
