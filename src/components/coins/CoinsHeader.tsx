
interface CoinsHeaderProps {
  symbol: string;
  price: number;
  changePercent: number;
  onOpenMenu?: () => void;
}

export default function CoinsHeader({ symbol, price, changePercent, onOpenMenu }: CoinsHeaderProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-gray-900 border-b border-gray-700">
      {/* Header Row */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <button
          className="p-2 active:bg-gray-800 rounded-lg transition"
          onClick={onOpenMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Center: Symbol and Change */}
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{symbol}</span>
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-sm">{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            {isPositive ? (
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {/* Right: Layout Icon */}
        <a href="/contract" className="p-2 active:bg-gray-800 rounded-lg transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </a>
      </div>

      {/* Price Display */}
      <div className="px-4 pb-3">
        <div className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </div>
      </div>
    </div>
  );
}
