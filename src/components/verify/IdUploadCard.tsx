interface IdUploadCardProps {
  label: string;
  inputId: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl?: string | null;
  error?: string;
}

export default function IdUploadCard({
  label,
  inputId,
  onChange,
  previewUrl,
  error,
}: IdUploadCardProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <label
        htmlFor={inputId}
        className="w-32 h-32 bg-gray-800 rounded-md flex items-center justify-center cursor-pointer active:bg-gray-700 transition"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 6H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </label>
      <p className="mt-3 text-sm text-gray-300">{label}</p>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}


