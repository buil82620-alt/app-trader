import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Props {
  register: (name: any) => any;
  error?: { message?: string };
}

export default function AgreementCheckbox({ register, error }: Props) {
  const { t } = useAppTranslation();

  return (
    <div className="mb-6 flex items-start gap-2">
      <input
        type="checkbox"
        {...register('agree')}
        className="mt-1 w-5 h-5 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
      />
      <label className="text-gray-400 text-sm">
        {t('register.form.checkboxTextPrefix')}&nbsp;
        <span className="text-green-400">
          {t('register.form.checkboxHighlight')}
        </span>
      </label>
      {error && <p className="text-red-500 text-xs ml-2">{error.message}</p>}
    </div>
  );
}

