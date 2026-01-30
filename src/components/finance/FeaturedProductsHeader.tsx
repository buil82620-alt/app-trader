import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function FeaturedProductsHeader() {
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
      <h2 className="text-white font-medium text-lg">
        {t('finance.featuredProductsTitle')}
      </h2>
      <button className="p-2 active:opacity-70 transition">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>
    </div>
  );
}
