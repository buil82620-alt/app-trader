import type { TransferCoin } from './transferConfig';

interface Props {
  open: boolean;
  coins: TransferCoin[];
  selected: string;
  onClose: () => void;
  onSelect: (symbol: string) => void;
}

export default function CoinSelectMenu({ open, coins, selected, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />

      {/* bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-md rounded-t-3xl bg-[#1f252b] shadow-2xl border-t overflow-hidden animate-slide-up" style={{ background: '#0e0e0e' }}>
          <div className="px-4 pt-4 pb-2 flex items-center justify-center relative">
            <div className="absolute left-0 right-0 top-1 flex justify-center">
              <span className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div className="text-white font-semibold text-lg">Select coin</div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {coins.map((c) => {
              const isActive = c.symbol === selected;
              return (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => {
                    onSelect(c.symbol);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left transition-transform duration-150 ${
                    isActive ? 'bg-emerald-500/10' : 'bg-transparent'
                  } active:bg-white/5 hover:translate-x-0.5`}
                >
                  <span className="text-white text-base">{c.symbol}</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


