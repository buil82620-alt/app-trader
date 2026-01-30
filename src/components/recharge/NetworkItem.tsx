interface NetworkItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export default function NetworkItem({ icon, label, onClick }: NetworkItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-white text-base">{label}</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}


