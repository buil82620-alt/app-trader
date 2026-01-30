import { useEffect, useMemo, useState } from 'react';
import ChainTabs, { type ChainKey } from './ChainTabs';
import WithdrawRecordEmpty from './WithdrawRecordEmpty';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  coin: string;
}

function getFee(coin: string, chain: ChainKey): number {
  // demo fees (can be wired to API later)
  if (coin === 'USDT') return chain === 'ERC20' ? 5 : 1;
  if (coin === 'BTC') return 0.0005;
  if (coin === 'ETH') return 0.005;
  return 0.5;
}

export default function WithdrawForm({ coin }: Props) {
  const [chain, setChain] = useState<ChainKey>('ERC20');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txPassword, setTxPassword] = useState('');
  const [available, setAvailable] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [records, setRecords] = useState<
    Array<{
      id: number;
      asset: string;
      chain: string;
      amount: number;
      fee: number;
      arrival: number;
      status: string;
      createdAt: string;
    }>
  >([]);
  const { t } = useAppTranslation();
  const token = useAuthStore((s) => s.token);

  const minWithdraw = coin === 'USDT' ? 10 : 0;
  const fee = useMemo(() => getFee(coin, chain), [coin, chain]);

  const amountNum = Number(amount);
  const isAmountValid =
    Number.isFinite(amountNum) && amountNum > 0 && amountNum >= minWithdraw;
  const isAddressValid = address.trim().length > 0;
  const isPasswordValid = txPassword.trim().length >= 6;
  const arrival = isAmountValid ? Math.max(0, amountNum - fee) : 0;

  const canSubmit = isAmountValid && isAddressValid && isPasswordValid;

  const refreshData = async () => {
    if (!token) return;
    try {
      // balance
      const balRes = await fetch('/api/coins/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balData = await balRes.json();
      if (balRes.ok && balData?.success && Array.isArray(balData.balances)) {
        const item = balData.balances.find((b: any) => String(b.asset).toUpperCase() === coin.toUpperCase());
        const avail = item ? Number(item.available) : 0;
        setAvailable(Number.isFinite(avail) ? avail : 0);
      } else {
        setAvailable(0);
      }

      // history
      const rRes = await fetch(`/api/withdraw/requests?asset=${encodeURIComponent(coin)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rData = await rRes.json();
      if (rRes.ok && rData?.success && Array.isArray(rData.requests)) {
        setRecords(rData.requests);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error('Withdraw refresh error:', e);
    }
  };

  useEffect(() => {
    if (!token) return;
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, coin]);

  const handleSubmit = async () => {
    if (!canSubmit || !token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset: coin,
          chain,
          address,
          amount: amountNum,
          txPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Withdraw failed');
        return;
      }
      alert(t('withdraw.form.submittedAlert'));
      setAddress('');
      setAmount('');
      setTxPassword('');
      await refreshData();
    } catch (e) {
      console.error('Withdraw submit error:', e);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 text-white">
      <div className="text-xl font-medium">
        {t('withdraw.form.title', { coin })}
      </div>
      <div className="text-gray-400 text-sm mt-1">
        {t('withdraw.form.available', { amount: available, coin })}
      </div>

      <div className="mt-6">
        <div className="text-lg font-medium mb-3">
          {t('withdraw.form.chainTypeLabel')}
        </div>
        <ChainTabs value={chain} onChange={setChain} />
      </div>

      <div className="mt-6 border-t border-white/10" />

      <div className="mt-6">
        <div className="text-lg font-medium mb-3">
          {t('withdraw.form.addressLabel')}
        </div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('withdraw.form.addressPlaceholder')}
            className="flex-1 bg-transparent text-gray-400 placeholder:text-gray-600 outline-none"
          />
          <button
            type="button"
            onClick={() => alert(t('withdraw.form.addressSetupAlert'))}
            className="text-white text-lg"
          >
            {t('withdraw.form.addressSetup')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-lg font-medium mb-3">
          {t('withdraw.form.quantityLabel')}
        </div>
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder={t('withdraw.form.quantityPlaceholder', {
              min: minWithdraw.toFixed(coin === 'USDT' ? 1 : 0),
            })}
            className="flex-1 bg-transparent text-gray-200 placeholder:text-gray-600 outline-none"
          />
          <div className="text-white text-lg">{coin}</div>
          <div className="h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={() => setAmount(String(available))}
            className="text-white text-lg"
          >
            {t('withdraw.form.allButton')}
          </button>
        </div>
        {amount.length > 0 && !isAmountValid && (
          <div className="mt-2 text-sm text-red-400">
            {t('withdraw.form.minAmountError', {
              min: minWithdraw,
              coin,
            })}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="text-lg font-medium mb-3">
          {t('withdraw.form.txPasswordLabel')}
        </div>
        <div className="pb-4 border-b border-white/10">
          <input
            value={txPassword}
            onChange={(e) => setTxPassword(e.target.value)}
            type="password"
            placeholder={t('withdraw.form.txPasswordPlaceholder')}
            className="w-full bg-transparent text-gray-200 placeholder:text-gray-600 outline-none"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4 text-base">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">
            {t('withdraw.form.arrivalLabel')}
          </span>
          <span className="text-gray-200">
            {isAmountValid ? `${arrival} ${coin}` : `0 ${coin}`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">
            {t('withdraw.form.feeLabel')}
          </span>
          <span className="text-gray-200">
            {fee} {coin}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={`mt-8 w-full h-14 rounded-2xl font-semibold text-lg transition ${
          canSubmit && !isSubmitting
            ? 'bg-emerald-400 text-gray-900'
            : 'bg-emerald-400/50 text-gray-900/70'
        }`}
      >
        {isSubmitting ? 'Submitting...' : t('withdraw.form.submitButton')}
      </button>

      <div className="mt-6 text-lg text-gray-200">
        {t('withdraw.form.recordTitle')}
      </div>
      {records.length === 0 ? (
        <WithdrawRecordEmpty />
      ) : (
        <div className="mt-4 space-y-2">
          {records.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">
                  {r.asset} ({r.chain})
                </div>
                <div className="text-sm text-gray-300">{r.status}</div>
              </div>
              <div className="mt-2 text-sm text-gray-300 flex items-center justify-between">
                <span>{t('withdraw.form.quantityLabel')}</span>
                <span className="text-white">{Number(r.amount).toFixed(coin === 'USDT' ? 2 : 6)} {r.asset}</span>
              </div>
              <div className="mt-1 text-sm text-gray-300 flex items-center justify-between">
                <span>{t('withdraw.form.feeLabel')}</span>
                <span className="text-white">{Number(r.fee).toFixed(coin === 'USDT' ? 2 : 6)} {r.asset}</span>
              </div>
              <div className="mt-1 text-sm text-gray-300 flex items-center justify-between">
                <span>{t('withdraw.form.arrivalLabel')}</span>
                <span className="text-white">{Number(r.arrival).toFixed(coin === 'USDT' ? 2 : 6)} {r.asset}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


