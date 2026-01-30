import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../login/InputField';
import IdUploadCard from '../verify/IdUploadCard';
import DatePicker from 'react-mobile-datepicker';
import { useAppTranslation } from '../../hooks/useAppTranslation';

type LoanFormData = {
  name: string;
  surname: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  country: string;
  phone: string;
  certificateType: string;
  handheldPhoto: File | null;
};

export default function LoanForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const { t } = useAppTranslation();

  const loanSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('loan.form.errors.nameRequired')),
        surname: z.string().min(1, t('loan.form.errors.surnameRequired')),
        gender: z.enum(['Male', 'Female', 'Other']),
        dateOfBirth: z.string().min(1, t('loan.form.errors.dobRequired')),
        country: z.string().min(1, t('loan.form.errors.countryRequired')),
        phone: z.string().min(1, t('loan.form.errors.phoneRequired')),
        certificateType: z
          .string()
          .min(1, t('loan.form.errors.certificateRequired')),
        handheldPhoto: z
          .any()
          .refine(
            (file) => file instanceof File,
            t('loan.form.errors.photoRequired')
          ),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      gender: 'Male',
      certificateType: 'ID',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('handheldPhoto', file, { shouldValidate: true });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: LoanFormData) => {
    console.log('Loan verification submit: ', data);
    alert(t('loan.form.submittedAlert'));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="px-4 pt-4 pb-10 bg-gray-900 min-h-screen"
    >
      <InputField
        label={t('loan.form.nameLabel')}
        name="name"
        placeholder={t('loan.form.namePlaceholder')}
        register={register as any}
        error={errors.name as any}
      />

      <InputField
        label={t('loan.form.surnameLabel')}
        name="surname"
        placeholder={t('loan.form.surnamePlaceholder')}
        register={register as any}
        error={errors.surname as any}
      />

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          {t('loan.form.genderLabel')}
        </label>
        <div className="relative">
          <select
            {...register('gender')}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-green-400"
          >
            <option value="Male">{t('loan.form.gender.male')}</option>
            <option value="Female">{t('loan.form.gender.female')}</option>
            <option value="Other">{t('loan.form.gender.other')}</option>
          </select>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">
            {errors.gender.message as string}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          {t('loan.form.dobLabel')}
        </label>
        <button
          type="button"
          onClick={() => setDobPickerOpen(true)}
          className="w-full text-left bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-green-400"
        >
          {dobDate
            ? dobDate.toISOString().slice(0, 10)
            : t('loan.form.dobPlaceholder')}
        </button>
        {errors.dateOfBirth && (
          <p className="text-red-500 text-xs mt-1">
            {errors.dateOfBirth.message}
          </p>
        )}
        <DatePicker
          isOpen={dobPickerOpen}
          date={dobDate || new Date(1990, 0, 1)}
          onSelect={(date: Date) => {
            setDobDate(date);
            setDobPickerOpen(false);
            setValue('dateOfBirth', date.toISOString(), { shouldValidate: true });
          }}
          onCancel={() => setDobPickerOpen(false)}
          confirmText={t('loan.form.dobConfirm')}
          cancelText={t('loan.form.dobCancel')}
          theme="dark"
        />
      </div>

      <InputField
        label={t('loan.form.countryLabel')}
        name="country"
        placeholder={t('loan.form.countryPlaceholder')}
        register={register as any}
        error={errors.country as any}
      />

      <InputField
        label={t('loan.form.phoneLabel')}
        name="phone"
        placeholder={t('loan.form.phonePlaceholder')}
        register={register as any}
        error={errors.phone as any}
      />

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          {t('loan.form.certificateLabel')}
        </label>
        <div className="relative">
          <select
            {...register('certificateType')}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-green-400"
          >
            <option value="ID">{t('loan.form.certificate.id')}</option>
            <option value="Passport">
              {t('loan.form.certificate.passport')}
            </option>
            <option value="DriverLicense">
              {t('loan.form.certificate.driverLicense')}
            </option>
          </select>
        </div>
        {errors.certificateType && (
          <p className="text-red-500 text-xs mt-1">
            {errors.certificateType.message}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center mt-4 mb-4">
        <IdUploadCard
          label={t('loan.form.handheldLabel')}
          inputId="loan-handheld-photo"
          onChange={handlePhotoChange}
          previewUrl={photoPreview}
          error={errors.handheldPhoto?.message as string | undefined}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-400 text-gray-900 font-semibold py-3 rounded-full mt-2"
      >
        {t('loan.form.submitButton')}
      </button>
    </form>
  );
}


