import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import TransferHeader from './TransferHeader';
import AccountBox from './AccountBox';
import CoinSelectMenu from './CoinSelectMenu';
import TransferAmountSection from './TransferAmountSection';
import { TRANSFER_COINS } from './transferConfig';

type AccountType = 'coins' | 'contract';

interface Balances {
  [coin: string]: {
    coins: number;
    contract: number;
  };
}

interface TransferRecord {
  id: string;
  coin: string;
  amount: number;
  from: string;
  to: string;
  createdAt: string;
}

const FROM_LABEL = 'Coins Account';
const TO_LABEL = 'Contract Account';

export default function TransferPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);
  const [selectedCoin, setSelectedCoin] = useState('USDC');
  const [balances, setBalances] = useState<Balances>(() => {
    const base: Balances = {};
    TRANSFER_COINS.forEach((c) => {
      base[c.symbol] = {
        coins: 0,
        contract: 0,
      };
    });
    return base;
  });
  const [amount, setAmount] = useState('');
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [coinMenuOpen, setCoinMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  // Fetch balances for selected coin
  useEffect(() => {
    if (!isLoggedIn || !token || !selectedCoin) return;

    const fetchBalances = async () => {
      try {
        const res = await fetch(`/api/transfer/balances?asset=${encodeURIComponent(selectedCoin)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBalances((prev) => ({
              ...prev,
              [selectedCoin]: {
                coins: data.balances.coins,
                contract: data.balances.contract,
              },
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      }
    };

    fetchBalances();
  }, [isLoggedIn, token, selectedCoin]);

  // Fetch transfer history
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(`/api/transfer/history?limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const formattedRecords: TransferRecord[] = data.transfers.map((t: any) => ({
              id: String(t.id),
              coin: t.asset,
              amount: t.amount,
              from: t.fromAccount === 'coins' ? FROM_LABEL : TO_LABEL,
              to: t.toAccount === 'coins' ? FROM_LABEL : TO_LABEL,
              createdAt: new Date(t.createdAt).toLocaleString(),
            }));
            setRecords(formattedRecords);
          }
        }
      } catch (error) {
        console.error('Failed to fetch transfer history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isLoggedIn, token, selectedCoin]);

  const fromAccount: AccountType = 'coins';
  const toAccount: AccountType = 'contract';

  const available = useMemo(() => {
    const b = balances[selectedCoin];
    return b ? b[fromAccount] : 0;
  }, [balances, selectedCoin, fromAccount]);

  const amountNum = Number(amount);
  const isAmountValid = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= available;
  const canSubmit = isAmountValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transfer/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset: selectedCoin,
          amount: amountNum,
          fromAccount: 'coins',
          toAccount: 'contract',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update balances
          setBalances((prev) => {
            const current = prev[selectedCoin] ?? { coins: 0, contract: 0 };
            return {
              ...prev,
              [selectedCoin]: {
                coins: current.coins - amountNum,
                contract: current.contract + amountNum,
              },
            };
          });

          // Add to records
          const transfer = data.transfer;
          setRecords((prev) => [
            {
              id: String(transfer.id),
              coin: transfer.asset,
              amount: transfer.amount,
              from: FROM_LABEL,
              to: TO_LABEL,
              createdAt: new Date(transfer.createdAt).toLocaleString(),
            },
            ...prev,
          ]);

          setAmount('');
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f252b] text-white">
      <TransferHeader onBack={() => window.history.back()} />

      <AccountBox fromLabel={FROM_LABEL} toLabel={TO_LABEL} />

      <TransferAmountSection
        coin={selectedCoin}
        amount={amount}
        available={available}
        onAmountChange={setAmount}
        onAll={() => setAmount(String(available))}
        onOpenCoinMenu={() => setCoinMenuOpen(true)}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
        records={records}
        isSubmitting={isSubmitting}
        isLoadingHistory={isLoadingHistory}
      />

      <CoinSelectMenu
        open={coinMenuOpen}
        coins={TRANSFER_COINS}
        selected={selectedCoin}
        onClose={() => setCoinMenuOpen(false)}
        onSelect={(sym) => {
          setSelectedCoin(sym);
          setAmount('');
        }}
      />
    </div>
  );
}


