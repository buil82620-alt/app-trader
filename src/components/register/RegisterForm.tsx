import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputField from '../login/InputField';
import InputFieldWithButton from './InputFieldWithButton';
import CountrySelector from './CountrySelector';
import AgreementCheckbox from './AgreementCheckbox';
import ActionButton from './ActionButton';
import { useAppTranslation } from '../../hooks/useAppTranslation';

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  country: string;
  phone: string;
  invitation: string;
};

export default function RegisterForm() {
  const { t } = useAppTranslation();

  const registerSchema = useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .email(t('register.form.errors.invalidEmail'))
            .min(1, t('register.form.errors.emailRequired')),
          password: z
            .string()
            .min(6, t('register.form.errors.passwordMin')),
          confirmPassword: z
            .string()
            .min(1, t('register.form.errors.confirmPasswordRequired')),
          code: z
            .string()
            .min(1, t('register.form.errors.codeRequired')),
          country: z.string().min(1),
          phone: z
            .string()
            .min(1, t('register.form.errors.phoneRequired')),
          invitation: z.string().optional(),
          agree: z.literal(true, {
            errorMap: () => ({
              message: t('register.form.errors.agreeRequired'),
            }),
          }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('register.form.errors.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 409) {
          setError('email', {
            type: 'manual',
            message:
              result.error ||
              t('register.form.errors.emailConflictDefault'),
          });
        } else {
          setSubmitError(
            result.error ||
              t('register.form.errors.submitErrorDefault')
          );
        }
        setIsLoading(false);
        return;
      }

      if (result.success) {
        // Registration successful - redirect to login page
        window.location.href = '/login';
      } else {
        setSubmitError('Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Register error:', error);
      setSubmitError(t('register.form.errors.networkError'));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-8">
      <InputField
        label={t('register.form.emailLabel')}
        name="email"
        placeholder={t('register.form.emailPlaceholder')}
        register={register}
        error={errors.email}
      />
      <InputField
        label={t('register.form.passwordLabel')}
        name="password"
        type="password"
        placeholder={t('register.form.passwordPlaceholder')}
        register={register}
        error={errors.password}
        showPasswordToggle
      />
      <InputField
        label={t('register.form.confirmPasswordLabel')}
        name="confirmPassword"
        type="password"
        placeholder={t('register.form.confirmPasswordPlaceholder')}
        register={register}
        error={errors.confirmPassword}
        showPasswordToggle
      />
      <InputFieldWithButton
        label={t('register.form.codeLabel')}
        name="code"
        placeholder={t('register.form.codePlaceholder')}
        register={register}
        error={errors.code}
        buttonText={t('register.form.codeButtonSend')}
        onClick={() => console.log('Send code')}
      />
      <CountrySelector register={register as any} />
      <InputField
        label={t('register.form.invitationLabel')}
        name="invitation"
        placeholder={t('register.form.invitationPlaceholder')}
        register={register}
        error={errors.invitation}
      />
      <AgreementCheckbox register={register as any} error={errors.agree} />

      {submitError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      <ActionButton
        text={
          isLoading
            ? t('register.form.buttons.registering')
            : t('register.form.buttons.register')
        }
        type="submit"
        disabled={isLoading}
      />
      <div className="text-center">
        <span className="text-gray-400 text-sm">{t('register.form.alreadyHaveAccount')} </span>
        <a href="/login" className="text-green-400 text-sm">
          {t('register.form.loginLink')}
        </a>
      </div>
    </form>
  );
}

