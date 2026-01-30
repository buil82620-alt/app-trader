interface Props {
  name: string;
  imageUrl?: string;
  onClick: () => void;
}

export default function WithdrawAssetItem({ name, imageUrl, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-4 border-b border-white/10 bg-[#1f252b] active:bg-white/5 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <div className="text-white text-lg font-medium">{name}</div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}


