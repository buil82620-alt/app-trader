interface Props {
  fromCoin: string;
  toCoin: string;
  amount: string;
  onAmountChange: (v: string) => void;
  onAll: () => void;
  available: number;
  rate: number;
  expectedTo: number;
  canSubmit: boolean;
  onSubmit: () => void;
}

export default function ExchangeAmountSection({
  fromCoin,
  toCoin,
  amount,
  onAmountChange,
  onAll,
  available,
  rate,
  expectedTo,
  canSubmit,
  onSubmit,
}: Props) {
  return (
    <div className="px-4 pt-8 pb-24 text-white space-y-6">
      <div className="text-lg font-semibold tracking-wide">Exchange quantity</div>

      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            inputMode="decimal"
            placeholder="Please enter exchange"
            className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-600 outline-none text-base"
          />
          <div className="text-white text-base">
            {fromCoin}
          </div>
          <div className="h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={onAll}
            className="text-emerald-400 text-base"
          >
            All
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Available{fromCoin} {available.toFixed(8)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-gray-400 leading-tight">Current exchange</div>
          <div className="text-gray-400 leading-tight">rate</div>
          <div className="mt-2 text-white text-sm">
            {rate.toFixed(2)}
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-gray-400 leading-tight">Available{fromCoin}</div>
          <div className="mt-2 text-white text-sm">
            {available.toFixed(8)}
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-gray-400 leading-tight">Expected to be</div>
          <div className="text-gray-400 leading-tight">available{toCoin}</div>
          <div className="mt-2 text-white text-sm">
            {expectedTo.toFixed(8)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-10 w-full h-14 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-[0_10px_25px_rgba(16,185,129,0.35)] ${
          canSubmit
            ? 'bg-emerald-400 text-gray-900 active:translate-y-[1px] active:shadow-[0_6px_15px_rgba(16,185,129,0.3)]'
            : 'bg-emerald-400/50 text-gray-900/70 opacity-70'
        }`}
      >
        Exchange
      </button>
    </div>
  );
}


