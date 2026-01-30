interface ChatMessageProps {
  from: 'bot' | 'user';
  text: string;
  imageUrl?: string | null;
  timestamp?: string;
}

export default function ChatMessage({ from, text, imageUrl, timestamp }: ChatMessageProps) {
  const isBot = from === 'bot';

  if (isBot) {
    return (
      <div className="flex items-start gap-2 px-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          CPT
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[75%] shadow-sm">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg mb-2"
              loading="lazy"
            />
          )}
          {text && <p className="text-sm text-gray-800">{text}</p>}
          {timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end px-3">
      <div className="bg-blue-500 rounded-2xl px-4 py-3 max-w-[75%] shadow-sm">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Shared image"
            className="max-w-full h-auto rounded-lg mb-2"
            loading="lazy"
          />
        )}
        {text && <p className="text-sm text-white text-right">{text}</p>}
        {timestamp && (
          <p className="text-xs text-white/70 mt-1 text-right">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}


