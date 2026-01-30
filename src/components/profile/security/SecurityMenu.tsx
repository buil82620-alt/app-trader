import { useAppTranslation } from '../../../hooks/useAppTranslation';

interface Props {
  onSelect: (type: 'login' | 'transaction') => void;
}

export default function SecurityMenu({ onSelect }: Props) {
  const { t } = useAppTranslation();

  return (
    <div className="mt-4 border-t border-b border-gray-800">
      {[
        { key: 'login' as const, labelKey: 'profile.security.loginPassword' },
        { key: 'transaction' as const, labelKey: 'profile.security.transactionPassword' },
      ].map((item, index) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className={`w-full flex items-center justify-between px-4 py-4 text-left active:bg-white/5 ${
            index === 0 ? 'border-b border-gray-800' : ''
          }`}
        >
           <span className="text-white text-base">{t(item.labelKey)}</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              {t('security.menu.revise')}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
       ))}
     </div>
   );
}

