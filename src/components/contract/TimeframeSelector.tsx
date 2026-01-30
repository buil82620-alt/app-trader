type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
}

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '5m', label: '5M' },
  { value: '15m', label: '15M' },
  { value: '30m', label: '30M' },
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1WEEK' },
  { value: '1M', label: '1MON' },
];

export default function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  return (
    <div className="bg-gray-900 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onSelect(tf.value)}
            className={`px-4 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition ${
              selected === tf.value
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
