import { useAppTranslation } from '../../hooks/useAppTranslation';

interface BankCardModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BankCardModal({ open, onClose }: BankCardModalProps) {
  const { t } = useAppTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-6 bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('rechargePage.bankModal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-3 pb-5">
          <p className="text-sm text-gray-700 mb-6">
            {t('rechargePage.bankModal.content')}
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md"
            >
              {t('rechargePage.bankModal.ok')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


