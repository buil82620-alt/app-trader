import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function RegulatoryHeader() {
  const { t } = useAppTranslation();
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="w-full flex items-center px-4 py-3 bg-white">
      <button
        type="button"
        onClick={handleBack}
        className="w-9 h-9 mr-3 bg-gray-200 rounded-full flex items-center justify-center active:bg-gray-300 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span className="text-gray-800 text-base">
        {t('regulatory.header.counter')}
      </span>
    </header>
  );
}


