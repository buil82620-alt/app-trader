interface Props {
  fromLabel: string;
  toLabel: string;
}

export default function AccountBox({ fromLabel, toLabel }: Props) {
  return (
    <div className="mt-5 mx-4 rounded-2xl border border-white/15 bg-[#1f252b] shadow-[0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="px-4 py-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">From</span>
          <span className="text-white text-sm">{fromLabel}</span>
        </div>
      </div>
      <div className="mx-4 h-px bg-white/10" />
      <div className="px-4 py-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-rose-500" style={{ backgroundColor: '#FF6B6B' }}/>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">To</span>
          <span className="text-white text-sm">{toLabel}</span>
        </div>
      </div>
    </div>
  );
}


