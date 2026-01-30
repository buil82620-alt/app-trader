type RegisterFunction = (name: string) => {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  ref: (instance: HTMLInputElement | null) => void;
};

import { useAppTranslation } from '../../hooks/useAppTranslation';

interface CheckboxAndLinkProps {
  register: RegisterFunction;
}

export default function CheckboxAndLink({ register }: CheckboxAndLinkProps) {
  const { t } = useAppTranslation();
  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log('Forgot password clicked');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          {...register('rememberPassword')}
          className="w-4 h-4 text-green-500 bg-gray-800 border-gray-700 rounded focus:ring-green-500 focus:ring-2"
        />
        <span className="text-white text-sm ml-2">
          {t('login.form.remember')}
        </span>
      </label>
    </div>
  );
}
