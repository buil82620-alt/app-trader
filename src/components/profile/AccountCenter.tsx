import { useAuthStore } from '../../stores/authStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  key: 'referral' | 'security' | 'logout';
}

export default function AccountCenter() {
  const logout = useAuthStore((state) => state.logout);
  const { t } = useAppTranslation();

  const menuItems: MenuItem[] = [
    {
      label: t('profile.referralLink'),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M10 13a5 5 0 007.54.54l1.92-1.92a4 4 0 00-5.66-5.66l-1.03 1.03"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 00-7.54-.54L4.54 12.38a4 4 0 005.66 5.66l1.03-1.03"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      key: 'referral',
    },
    {
      label: t('profile.securityCenter'),
      icon: (
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      key: 'security',
    },
    {
      label: t('profile.logout'),
      icon: (
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
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 12H9m0 0l3-3m-3 3l3 3"
          />
        </svg>
      ),
      key: 'logout',
    },
  ];

  return (
    <div className="px-4 mb-4">
      <h3 className="text-white font-medium mb-3">Account center</h3>
      <div className="bg-[#3b4338] rounded-3xl overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center justify-between px-5 py-4 text-left transition ${
              index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
            } active:bg-white/5`}
            onClick={() => {
              if (item.key === 'referral') {
                window.location.href = '/referral';
              } else if (item.key === 'security') {
                window.location.href = '/security-center';
              } else if (item.key === 'logout') {
                logout();
                window.location.href = '/login';
              }
            }}
          >
            <div className="flex items-center">
              <div className="text-white mr-3">{item.icon}</div>
              <span className="text-white text-sm">{item.label}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white/70"
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
          </button>
        ))}
      </div>
    </div>
  );
}
