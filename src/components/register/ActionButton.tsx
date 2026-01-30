interface Props {
  text: string;
  type?: 'submit' | 'button';
  onClick?: () => void;
  disabled?: boolean;
}

export default function ActionButton({ text, type = 'button', onClick, disabled = false }: Props) {
  return (
    <button
      type={type}
      className={`w-full bg-green-500 text-gray-900 font-semibold py-3 rounded-full transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

