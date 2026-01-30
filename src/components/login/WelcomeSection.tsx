import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function WelcomeSection() {
  const { t } = useAppTranslation();

  return (
    <div className="relative px-4 py-6 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 -mt-40 -mr-40 overflow-hidden">
        {/* Yellow Crescent Ring - Large C shape */}
        <div className="absolute top-0 right-0 w-56 h-56 border-[12px] border-yellow-400 rounded-full opacity-90" style={{
          clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
        }}></div>
        
        {/* Translucent Grey Circle with blur */}
        <div className="absolute top-12 right-12 w-40 h-40 bg-gray-600 rounded-full opacity-40" style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}></div>
        
        {/* Green Stars */}
        <div className="absolute top-20 left-12 w-8 h-8 text-green-400 opacity-90">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="absolute top-32 left-20 w-5 h-5 text-green-400 opacity-70">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        {/* Green Curved Lines */}
        <svg className="absolute top-16 right-16 w-32 h-32 opacity-50" viewBox="0 0 100 100">
          <path
            d="M 10,50 Q 30,20 50,50 T 90,50"
            stroke="#10b981"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M 20,60 Q 40,30 60,60 T 100,60"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Yellow and White Circles below text */}
      <div className="absolute bottom-2 left-4 flex gap-2 items-center">
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>

      {/* Welcome Text */}
      <div className="relative z-10">
        <h1 className="text-white font-bold text-3xl mb-2">
          {t('login.welcome.title')}
        </h1>
        <p className="text-white text-lg">
          {t('login.welcome.subtitle')}
        </p>
      </div>
    </div>
  );
}
