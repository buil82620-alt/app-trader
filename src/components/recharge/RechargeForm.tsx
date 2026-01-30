import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../login/InputField';
import IdUploadCard from '../verify/IdUploadCard';
import DepositCard from './DepositCard';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';

type DepositFormData = {
  amount: string;
  certificate: File | null;
};

interface RechargeFormProps {
  networkLabel: string;
}

export default function RechargeForm({ networkLabel }: RechargeFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useAppTranslation();
  const { token } = useAuthStore();

  // Parse network label to extract asset and network
  const parseNetwork = (label: string) => {
    const parts = label.split('-');
    if (parts.length >= 2) {
      return {
        asset: parts[0].toUpperCase(),
        network: parts[1].toUpperCase(),
      };
    }
    return {
      asset: 'USDT',
      network: 'TRC20',
    };
  };

  const { asset, network } = parseNetwork(networkLabel);

  const depositSchema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .min(1, t('rechargePage.form.amountRequired'))
          .refine(
            (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
            {
              message: t('rechargePage.form.amountGreaterThanZero'),
            }
          ),
        certificate: z
          .any()
          .refine(
            (file) => file instanceof File,
            t('rechargePage.form.certificateRequired')
          ),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('certificate', file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: DepositFormData) => {
    if (!token) {
      setSubmitError('Please log in to submit deposit request');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { asset, network } = parseNetwork(networkLabel);
      
      const formData = new FormData();
      formData.append('amount', data.amount);
      formData.append('asset', asset);
      formData.append('network', network);
      formData.append('certificate', data.certificate!);

      const response = await fetch('/api/deposit/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit deposit request');
      }

      alert(t('rechargePage.form.submittedAlert') || 'Deposit request submitted successfully!');
      
      // Reset form
      setPreview(null);
      const form = document.querySelector('form');
      form?.reset();
    } catch (error: any) {
      console.error('Error submitting deposit request:', error);
      setSubmitError(error.message || 'Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="px-4 pt-4 pb-10 bg-gray-900 min-h-screen"
    >
      <DepositCard asset={asset} network={network} />

      <InputField
        label={t('rechargePage.form.amountLabel')}
        name="amount"
        placeholder={t('rechargePage.form.amountPlaceholder')}
        register={register as any}
        error={errors.amount as any}
      />

      <p className="text-sm text-gray-200 mt-4 mb-2">
        {t('rechargePage.form.uploadCertificate')}
      </p>
      <div className="flex justify-center">
        <IdUploadCard
          label=""
          inputId="deposit-certificate"
          onChange={handleCertificateChange}
          previewUrl={preview}
          error={errors.certificate?.message as string | undefined}
        />
      </div>

      {submitError && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-400 text-gray-900 font-semibold py-3 rounded-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting 
          ? (t('rechargePage.form.submitting') || 'Submitting...')
          : t('rechargePage.form.submitButton')
        }
      </button>
    </form>
  );
}


