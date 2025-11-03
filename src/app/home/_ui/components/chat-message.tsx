"use client";

import { cn } from "@/lib/utils";
import { parseVeloraResponse } from "@/utils/velora-parser";
import VeloraMessage from "./velora-message";
import MessageOptions from "./message-options";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface Props {
  index: number;
  message: Message;
  messages: Message[];
  isLoading: boolean;
  onSignWord?: (word: string) => void; // Callback for when user clicks a signable word
}

const ChatMessage = ({ index, message, messages, isLoading, onSignWord }: Props) => {
  const isUser = message.role === "user";
  const isLastMessage = index === messages.length - 1;

  // Check if this is a Velora teacher response (contains markup)
  const isVeloraResponse = !isUser && (
    message.content.includes('<text>') ||
    message.content.includes('<sign>')
  );

  const handleSignWord = (word: string) => {
    if (onSignWord) {
      onSignWord(word);
    } else {
      console.log('Sign word clicked:', word);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-x-2 p-2 group/message",
        isUser ? "text-start" : "items-start my-3",
        isLastMessage ? "pb-80" : "",
      )}
    >
      <div className="relative flex-1 px-1 overflow-hidden">
        <div
          data-id="message-content"
          className={cn(
            "flex flex-col grow",
            message.role === "user" && "bg-muted text-foreground w-fit max-w-[85%] ml-auto rounded-lg px-3 py-1.5",
            !isUser && message.content.length <= 90 && "pt-1"
          )}
        >
          {isVeloraResponse ? (
            // Render Velora teacher response with clickable words
            <VeloraMessage
              blocks={parseVeloraResponse(message.content).blocks}
              onSignWord={handleSignWord}
            />
          ) : (
            // Render regular message content
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        {/* Message options - only show for assistant messages */}
        {!isUser && (
          <div className="opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 mt-2 flex justify-end">
            <MessageOptions
              messageId={message.id}
              content={message.content}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;