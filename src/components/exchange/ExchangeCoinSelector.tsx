import { EXCHANGE_COINS } from './exchangeConfig';

interface Props {
  fromCoin: string;
  toCoin: string;
  onOpenToMenu: () => void;
  onSwap?: () => void;
  reversed?: boolean;
}

export default function ExchangeCoinSelector({
  fromCoin,
  toCoin,
  onOpenToMenu,
  onSwap,
  reversed = false,
}: Props) {
  const Left = reversed ? (
    <button
      type="button"
      onClick={onOpenToMenu}
      className="flex-1 max-w-[140px] px-6 py-3 rounded-lg bg-[#252b33] text-white text-base font-medium flex items-center justify-center shadow-md shadow-black/40 active:bg-[#2f353e] transition-transform duration-150 active:scale-[0.97]"
    >
      {toCoin}
    </button>
  ) : (
    <div className="flex-1 max-w-[140px] px-6 py-3 rounded-lg bg-[#252b33] text-white/90 text-base font-medium flex items-center justify-center shadow-md shadow-black/40">
      {fromCoin}
    </div>
  );

  const Right = reversed ? (
    <div className="flex-1 max-w-[140px] px-6 py-3 rounded-lg bg-[#252b33] text-white/90 text-base font-medium flex items-center justify-center shadow-md shadow-black/40">
      {fromCoin}
    </div>
  ) : (
    <button
      type="button"
      onClick={onOpenToMenu}
      className="flex-1 max-w-[140px] px-6 py-3 rounded-lg bg-[#252b33] text-white text-base font-medium flex items-center justify-center shadow-md shadow-black/40 active:bg-[#2f353e] transition-transform duration-150 active:scale-[0.97]"
    >
      {toCoin}
    </button>
  );

  return (
    <div className="mt-6 flex items-center justify-center gap-8 px-6">
      {Left}

      <button
        type="button"
        aria-label="Swap"
        onClick={onSwap}
        className="p-3 rounded-full bg-[#1f252b] border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.6)] active:scale-95 transition-transform duration-150"
      >
        <div className="flex flex-col gap-1 items-center">
          <span className="w-7 h-0.5 rounded-full bg-emerald-400 transform translate-x-1" />
          <span className="w-7 h-0.5 rounded-full bg-emerald-400 transform -translate-x-1" />
        </div>
      </button>

      {Right}
    </div>
  );
}


