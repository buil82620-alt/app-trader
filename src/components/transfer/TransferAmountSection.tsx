import LoadingSpinner from '../shared/LoadingSpinner';
import TransferRecordEmpty from './TransferRecordEmpty';

interface TransferRecord {
  id: string;
  coin: string;
  amount: number;
  from: string;
  to: string;
  createdAt: string;
}

interface Props {
  coin: string;
  amount: string;
  available: number;
  onAmountChange: (v: string) => void;
  onAll: () => void;
  onOpenCoinMenu: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  records: TransferRecord[];
  isSubmitting?: boolean;
  isLoadingHistory?: boolean;
}

export default function TransferAmountSection({
  coin,
  amount,
  available,
  onAmountChange,
  onAll,
  onOpenCoinMenu,
  onSubmit,
  canSubmit,
  records,
  isSubmitting = false,
  isLoadingHistory = false,
}: Props) {
  const availableLabel = `Available: ${available.toFixed(8)}${coin}`;

  return (
    <div className="px-4 pt-6 pb-24 text-white">
      <div className="text-lg mb-4">Transfer quantity</div>

      <div className="pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            inputMode="decimal"
            placeholder="Please enter the transfer amount"
            className="flex-1 bg-transparent text-gray-200 placeholder:text-gray-600 outline-none text-base"
          />
          <button
            type="button"
            onClick={onOpenCoinMenu}
            className="text-white text-base"
          >
            {coin}
          </button>
          <div className="h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={onAll}
            className="text-white text-base"
          >
            All
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">{availableLabel}</div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-6 w-full h-14 rounded-2xl font-semibold text-lg transition ${
          canSubmit ? 'bg-emerald-400 text-gray-900' : 'bg-emerald-400/10 text-gray-900/10'
        }`}
      >
        {isSubmitting ? 'Transferring...' : 'Transfer'}
      </button>

      <div className="mt-6 text-lg text-gray-200">Transfer record</div>

      {isLoadingHistory ? (
        <div className="pt-6 text-center text-gray-500"><LoadingSpinner /></div>
      ) : records.length === 0 ? (
        <TransferRecordEmpty />
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          {records.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-white/10 bg-[#22272d] px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-medium">
                  {r.amount} {r.coin}
                </div>
                <div className="text-gray-400 mt-1">
                  {r.from} → {r.to}
                </div>
              </div>
              <div className="text-gray-500 text-xs">{r.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


