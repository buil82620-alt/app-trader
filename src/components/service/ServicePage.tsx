import ServiceHeader from './ServiceHeader';
import ConversationBanner from './ConversationBanner';
import ChatWindow from './ChatWindow';
import EmailPromptCard from './EmailPromptCard';

export default function ServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <ServiceHeader />

      <div className="flex-1 flex flex-col">
        <ConversationBanner />

        {/* Chat area + email card */}
        <div className="flex-1 flex flex-col mt-2">
          <ChatWindow />
          <EmailPromptCard />
        </div>
      </div>
    </div>
  );
}


