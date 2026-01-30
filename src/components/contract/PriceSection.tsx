interface PriceSectionProps {
  price: number;
  changePercent: number;
}

export default function PriceSection({ price, changePercent }: PriceSectionProps) {
  const hasValidPrice = Number.isFinite(price) && price !== 0;
  const hasValidChange = Number.isFinite(changePercent);
  const isPositive = (hasValidChange ? changePercent : 0) >= 0;

  return (
    <div>
      {/* Price */}
      {hasValidPrice ? (
        <div
          className={`text-3xl font-bold ${
            isPositive ? 'text-green-400' : 'text-red-500'
          }`}
        >
          {price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ) : (
        <div className="h-8 w-32 rounded-md bg-white/10 animate-pulse" />
      )}

      {/* Change percent */}
      {hasValidChange ? (
        <div
          className={`flex items-center mt-1 ${
            isPositive ? 'text-green-400' : 'text-red-500'
          }`}
        >
          <span className="text-sm">
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%
          </span>
          {isPositive ? (
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      ) : (
        <div className="mt-2 h-4 w-20 rounded-md bg-white/5 animate-pulse" />
      )}
    </div>
  );
}
