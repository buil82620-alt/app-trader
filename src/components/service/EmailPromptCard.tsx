import { useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailPromptCard() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useAppTranslation();

  const handleSave = () => {
    if (!email) {
      setError(t('servicePage.emailCard.errorRequired'));
      setSaved(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t('servicePage.emailCard.errorInvalid'));
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
    // In real app: send email to backend here
  };

  return (
    <section className="bg-white rounded-t-3xl shadow-[0_-4px_12px_rgba(0,0,0,0.12)] px-5 pt-3 pb-3">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between py-2"
      >
        <h2 className="text-center font-semibold text-gray-900 flex-1">
          {t('servicePage.emailCard.title')}
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-600 transform transition-transform ${
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
        <div className="pt-2 pb-5">
          <p className="text-center text-xs text-gray-500 mb-5 leading-snug">
            {t('servicePage.emailCard.description')}
          </p>

          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('servicePage.emailCard.placeholder')}
              className={`w-full px-4 py-3 rounded-xl border text-sm ${
                error ? 'border-red-400' : 'border-gray-300'
              } bg-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500`}
            />
            {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
            {saved && !error && (
              <p className="text-green-500 text-xs mt-1 text-center">
                {t('servicePage.emailCard.saved')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md"
          >
            {t('servicePage.emailCard.button')}
          </button>
        </div>
      )}
    </section>
  );
}


