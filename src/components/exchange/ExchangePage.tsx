import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import CoinSelectMenu from '../transfer/CoinSelectMenu';
import ExchangeHeader from './ExchangeHeader';
import ExchangeCoinSelector from './ExchangeCoinSelector';
import ExchangeAmountSection from './ExchangeAmountSection';
import { EXCHANGE_COINS, getPrice } from './exchangeConfig';
import ExchangeRecordEmpty from './ExchangeRecordEmpty';
import LoadingSpinner from '../shared/LoadingSpinner';

interface Balances {
  [coin: string]: number;
}

export default function ExchangePage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);
  const fromCoin = 'USDT';
  const [toCoin, setToCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [balances, setBalances] = useState<Balances>(() => {
    const base: Balances = {};
    EXCHANGE_COINS.forEach((c) => {
      base[c.symbol] = c.symbol === 'USDT' ? 0 : 0;
    });
    return base;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [toUsdtPrice, setToUsdtPrice] = useState<number>(() => getPrice('BTC'));
  const [reversed, setReversed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState<{ rate: number; feeAmount: number; toAmount: number } | null>(null);
  const [history, setHistory] = useState<
    Array<{
      id: number;
      fromAsset: string;
      toAsset: string;
      fromAmount: number;
      toAmount: number;
      createdAt: string;
    }>
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const actualFromAsset = reversed ? toCoin : fromCoin;
  const actualToAsset = reversed ? fromCoin : toCoin;

  const available = useMemo(() => balances[actualFromAsset] ?? 0, [balances, actualFromAsset]);

  // Load balances from wallet
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/coins/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data?.success) return;
        const next: Balances = {};
        (data.balances || []).forEach((b: any) => {
          next[String(b.asset).toUpperCase()] = Number(b.available) || 0;
        });
        setBalances((prev) => ({ ...prev, ...next }));
      } catch (e) {
        console.error('Exchange balance load error:', e);
      }
    })();
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const symbol = `${toCoin}USDT`;

    async function loadOnce() {
      // fallback ngay lập tức để UI có số
      setToUsdtPrice(getPrice(toCoin));
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!res.ok) return;
        const json = (await res.json()) as { price?: string };
        const p = Number(json.price);
        if (!cancelled && Number.isFinite(p) && p > 0) setToUsdtPrice(p);
      } catch {
        // ignore, keep fallback
      }
    }

    loadOnce();
    const t = window.setInterval(loadOnce, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [toCoin]);

  // Hiển thị giống ảnh: "Current exchange rate" = giá coin theo USDT (vd BTC = 87998.11)
  const rate = toUsdtPrice || getPrice(toCoin);

  const amountNum = Number(amount);
  const isAmountValid = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= available;
  // local estimate for UI
  const expectedToLocal = isAmountValid && rate > 0 ? (reversed ? amountNum * rate : amountNum / rate) : 0;
  const canSubmit = isAmountValid && !isSubmitting;

  // Fetch quote from API to keep server logic consistent
  useEffect(() => {
    if (!token) return;
    if (!isAmountValid) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/exchange/quote?fromAsset=${encodeURIComponent(actualFromAsset)}&toAsset=${encodeURIComponent(
            actualToAsset
          )}&fromAmount=${encodeURIComponent(String(amountNum))}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!cancelled && res.ok && data?.success) {
          setQuote({
            rate: Number(data.quote.rate) || 0,
            feeAmount: Number(data.quote.feeAmount) || 0,
            toAmount: Number(data.quote.toAmount) || 0,
          });
        }
      } catch (e) {
        console.error('Exchange quote error:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, actualFromAsset, actualToAsset, amountNum, isAmountValid]);

  // Load history
  useEffect(() => {
    if (!token) return;
    setIsLoadingHistory(true);
    (async () => {
      try {
        const res = await fetch('/api/exchange/history?limit=20', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setHistory(
            (data.transactions || []).map((r: any) => ({
              id: r.id,
              fromAsset: r.fromAsset,
              toAsset: r.toAsset,
              fromAmount: r.fromAmount,
              toAmount: r.toAmount,
              createdAt: r.createdAt,
            }))
          );
        }
      } catch (e) {
        console.error('Exchange history load error:', e);
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, [token]);

  const handleSubmit = () => {
    if (!canSubmit || !token) return;
    (async () => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/exchange/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromAsset: actualFromAsset,
            toAsset: actualToAsset,
            fromAmount: amountNum,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data?.error || 'Exchange failed');
          return;
        }

        const tx = data.transaction;
        setBalances((prev) => ({
          ...prev,
          [tx.fromAsset]: (prev[tx.fromAsset] ?? 0) - Number(tx.fromAmount),
          [tx.toAsset]: (prev[tx.toAsset] ?? 0) + Number(tx.toAmount),
        }));
        setHistory((prev) => [
          {
            id: tx.id,
            fromAsset: tx.fromAsset,
            toAsset: tx.toAsset,
            fromAmount: Number(tx.fromAmount),
            toAmount: Number(tx.toAmount),
            createdAt: tx.createdAt,
          },
          ...prev,
        ]);
        setAmount('');
      } catch (e) {
        console.error('Exchange submit error:', e);
        alert('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const coinsForMenu = useMemo(
    () => EXCHANGE_COINS.filter((c) => c.symbol !== 'USDT').map((c) => ({ symbol: c.symbol })),
    []
  );

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-md mx-auto min-h-screen bg-[#14181d] shadow-xl animate-fade-in">
        <ExchangeHeader onBack={() => window.history.back()} />

        <ExchangeCoinSelector
          fromCoin={fromCoin}
          toCoin={toCoin}
          onOpenToMenu={() => setMenuOpen(true)}
          onSwap={() => {
            setReversed((prev) => !prev);
          }}
          reversed={reversed}
        />

        <ExchangeAmountSection
          fromCoin={actualFromAsset}
          toCoin={actualToAsset}
          amount={amount}
          onAmountChange={setAmount}
          onAll={() => setAmount(String(available))}
          available={available}
          rate={quote?.rate || (reversed ? rate : rate)}
          expectedTo={quote?.toAmount ?? expectedToLocal}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
        />

        <div className="px-4 pb-10">
          <div className="mt-2 text-lg text-gray-200">Exchange record</div>
          {isLoadingHistory ? (
            <div className="pt-6 text-center text-gray-500"><LoadingSpinner /></div>
          ) : history.length === 0 ? (
            <ExchangeRecordEmpty />
          ) : (
            <div className="mt-3 space-y-3 text-sm">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-white/10 bg-[#22272d] px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium">
                      {r.fromAmount} {r.fromAsset} → {r.toAmount} {r.toAsset}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CoinSelectMenu
          open={menuOpen}
          coins={coinsForMenu}
          selected={toCoin}
          onClose={() => setMenuOpen(false)}
          onSelect={(sym) => {
            setToCoin(sym);
            setAmount('');
          }}
        />
      </div>
    </div>
  );
}


