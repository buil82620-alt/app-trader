import { useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function ConversationBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useAppTranslation();

  return (
    <section className="bg-gradient-to-b from-blue-700 to-blue-900 text-white px-4 pt-3 pb-3 rounded-b-3xl shadow-md relative overflow-hidden">
      {/* Decorative background pattern (simple opacity) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_10%_20%,#ffffff_0,transparent_40%),radial-gradient(circle_at_80%_0,#ffffff_0,transparent_30%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Collapse button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2"
        >
          <span className="text-sm font-medium">
            {t('servicePage.banner.question')}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transform transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="w-full flex flex-col items-center pt-2">
            {/* Tab button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 shadow-md mb-4"
            >
              <span className="text-sm font-medium">
                {t('servicePage.banner.tabTitle')}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* CPT avatars */}
            <div className="flex gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-xs font-bold">
                CPT
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-xs font-bold">
                CPT
              </div>
            </div>
          </div>
        )}

        {isOpen && !isCollapsed && (
          <div className="absolute right-4 top-20 z-20 bg-white text-gray-800 rounded-lg shadow-lg text-xs py-1 px-2">
            <p>{t('servicePage.banner.featureDev')}</p>
          </div>
        )}
      </div>
    </section>
  );
}


