import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function ServiceHeader() {
  const { t } = useAppTranslation();
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-gray-900 text-white px-4 pt-4 pb-3 flex items-center">
      <button
        onClick={handleBack}
        className="w-9 h-9 mr-3 bg-gray-800 rounded-full flex items-center justify-center active:bg-gray-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
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
      <h1 className="text-xl font-semibold">
        {t('servicePage.headerTitle')}
      </h1>
    </header>
  );
}


