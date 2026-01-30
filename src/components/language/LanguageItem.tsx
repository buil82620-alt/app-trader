interface LanguageItemProps {
  flagUrl: string;
  label: string;
  code: string;
  selected: boolean;
  onSelect: () => void;
}

export default function LanguageItem({
  flagUrl,
  label,
  code,
  selected,
  onSelect,
}: LanguageItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center px-5 py-4 rounded-3xl mb-3 bg-gray-800 active:bg-gray-700 transition border ${
        selected ? 'border-green-400' : 'border-transparent'
      }`}
    >
      <span className="mr-4 flex items-center">
        <img
          src={flagUrl}
          alt={label}
          className="w-7 h-5 rounded shadow-sm object-cover"
        />
      </span>
      <span
        className={`text-base ${
          selected ? 'text-green-400 font-medium' : 'text-white'
        }`}
      >
        {label}
      </span>
      <span className="sr-only">({code})</span>
    </button>
  );
}


