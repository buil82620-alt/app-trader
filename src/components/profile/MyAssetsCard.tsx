import { useEffect, useMemo, useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';

export default function MyAssetsCard() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useAppTranslation();
  const token = useAuthStore((s) => s.token);

  const [availableUsdt, setAvailableUsdt] = useState<number>(0);
  const [totalUsdt, setTotalUsdt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatMoney = useMemo(() => {
    return (value: number) =>
      value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Not logged in -> show zeros, no loading
      if (!token) {
        if (!cancelled) {
          setAvailableUsdt(0);
          setTotalUsdt(0);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const res = await fetch('/api/coins/balance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load balance');
        }

        const balances = Array.isArray(data?.balances) ? data.balances : [];
        const usdt = balances.find((b: any) => b?.asset === 'USDT');

        const available = Number(usdt?.available ?? 0);
        const total = Number(usdt?.total ?? available);

        if (!cancelled) {
          setAvailableUsdt(Number.isFinite(available) ? available : 0);
          setTotalUsdt(Number.isFinite(total) ? total : 0);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('MyAssetsCard balance error:', e);
        if (!cancelled) {
          setAvailableUsdt(0);
          setTotalUsdt(0);
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-4 mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-green-600 to-green-800 shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-medium">
            {t('profile.myAssetsTitle')}
          </h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 active:opacity-70 transition"
          >
            {isVisible ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Main Balance */}
        <div className="text-center mb-6">
          {isVisible ? (
            isLoading ? (
              <div className="mx-auto h-9 w-40 rounded-full bg-white/20 animate-pulse" />
            ) : (
              <div className="text-white text-4xl font-bold">
                {formatMoney(totalUsdt)}
              </div>
            )
          ) : (
            <div className="text-white text-4xl font-bold">****</div>
          )}
        </div>

        {/* Available */}
        <div className="flex items-center justify-between">
          <span className="text-gray-200 text-sm">
            {t('profile.available')}
          </span>
          <a href="/assets" className="text-gray-200 text-sm flex items-center">
            {isVisible ? formatMoney(availableUsdt) : '****'} 
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
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
          </a>
        </div>
      </div>
    </div>
  );
}
