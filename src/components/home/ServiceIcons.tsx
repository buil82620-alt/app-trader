import { useAppTranslation } from '../../hooks/useAppTranslation';

interface ServiceItem {
  icon: React.ReactNode;
  labelKey: string;
  href: string;
}

export default function ServiceIcons() {
  const { t } = useAppTranslation();

  const services: ServiceItem[] = [
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M5 5.5C5 4.119 6.343 3 8 3h8c1.657 0 3 1.119 3 2.5v5c0 1.381-1.343 2.5-3 2.5H11l-3 3v-3H8C6.343 13 5 11.881 5 10.5v-5Z"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      labelKey: 'home.service',
      href: '/service',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle
            cx="12"
            cy="12"
            r="8"
            strokeWidth="1.7"
          />
          <path
            d="M8.5 12.5 11 15l4.5-6"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      labelKey: 'home.verified',
      href: '/verify',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect
            x="3.5"
            y="6"
            width="17"
            height="12"
            rx="2"
            strokeWidth="1.7"
          />
          <path
            d="M10 12h5.5M10 9.5h3"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M6.5 9h1.5"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
      labelKey: 'home.recharge',
      href: '/recharge',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M6 9V7c0-1.105.895-2 2-2h8c1.105 0 2 .895 2 2v2"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M5 9h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Z"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 13h4"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
      labelKey: 'home.regulatory',
      href: '/regulatory',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle
            cx="12"
            cy="12"
            r="8"
            strokeWidth="1.7"
          />
          <path
            d="M12 7v10M9.5 9.5h3.2a1.8 1.8 0 1 1 0 3.6H11m0 0H9.5"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      labelKey: 'home.loan',
      href: '/loan',
    },
  ];

  return (
    <div className="bg-gray-900 px-4 py-6">
      <div className="flex justify-around items-start">
        {services.map((service, index) => (
          <a href={service.href} key={index} className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-green-500 mb-2 border border-green-500 border-opacity-30 active:bg-gray-700 transition">
              {service.icon}
            </div>
            <span className="text-xs text-gray-400 text-center px-1 leading-tight">
              {t(service.labelKey)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
