interface Props {
  onBack: () => void;
}

export default function ExchangeHeader({ onBack }: Props) {
  return (
    <div className="sticky top-0 z-40 bg-[#14181d]/95 backdrop-blur">
      <div className="h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#232932] active:bg-white/10 transition"
          aria-label="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-200"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex-1 text-center text-white text-xl font-semibold tracking-wide">
          Exchange
        </div>

        <div className="w-9 h-9" />
      </div>
    </div>
  );
}


