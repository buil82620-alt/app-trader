export default function WalletConnectHeader() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="pt-8 px-4 pb-4">
      <button
        onClick={handleBack}
        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center active:bg-gray-700 transition-colors"
        aria-label="Back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </header>
  );
}

