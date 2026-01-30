import { useAppTranslation } from '../../hooks/useAppTranslation';

interface ActionButton {
  icon: React.ReactNode;
  labelKey: string;
  href: string;
}

export default function ActionButtons() {
  const { t } = useAppTranslation();

  const actions: ActionButton[] = [
    {
      labelKey: 'profile.actions.recharge',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      href: '/recharge',
    },
    {
      labelKey: 'profile.actions.withdraw',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      href: '/withdraw',
    },
    {
      labelKey: 'profile.actions.transfer',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      href: '/transfer',
    },
    {
      labelKey: 'profile.actions.exchange',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      href: '/exchange',
    },
  ];

  return (
    <div className="flex justify-around items-center px-4 py-6 mb-4">
      {actions.map((action, index) => (
        <a href={action.href}
          key={index}
          className="flex flex-col items-center active:opacity-70 transition"
        >
          <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <div className="text-gray-300">{action.icon}</div>
          </div>
          <span className="text-white text-xs">{t(action.labelKey)}</span>
        </a>
      ))}
    </div>
  );
}
