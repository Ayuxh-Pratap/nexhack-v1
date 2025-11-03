import { ChatPage } from "./_ui/chat-page";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default function ChatPageRoute({ params }: ChatPageProps) {
  return <ChatPage chatId={params.chatId} />;
}
