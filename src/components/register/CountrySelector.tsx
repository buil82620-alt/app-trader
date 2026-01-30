import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Props {
  register: (name: any) => any;
}

export default function CountrySelector({ register }: Props) {
  const { t } = useAppTranslation();

  return (
    <div className="mb-4">
      <label className="block text-white text-sm mb-2">
        {t('register.form.phoneGroupLabel')}
      </label>
      <div className="flex">
        <select
          {...register('country')}
          className="bg-green-500 text-gray-900 px-3 py-3 rounded-l-lg border border-green-500"
        >
          <option value="America">
            {t('register.form.countryOptions.america')}
          </option>
          <option value="Vietnam">
            {t('register.form.countryOptions.vietnam')}
          </option>
          <option value="China">
            {t('register.form.countryOptions.china')}
          </option>
        </select>
        <input
          type="text"
          {...register('phone')}
          placeholder={t('register.form.phonePlaceholder')}
          className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-r-lg border border-l-0 border-gray-700 focus:outline-none focus:border-green-400 placeholder-gray-500"
        />
      </div>
    </div>
  );
}

