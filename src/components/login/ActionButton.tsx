interface ActionButtonProps {
  text: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function ActionButton({
  text,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-lg font-medium transition ${
        variant === 'primary'
          ? 'bg-neon-green hover:bg-green-400 text-gray-900 font-semibold shadow-lg shadow-neon-green/30'
          : 'bg-gray-800 hover:bg-gray-700 text-white'
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {text}
    </button>
  );
}
