"use client";

import { cn } from "@/lib/utils";
import { parseVeloraResponse } from "@/utils/velora-parser";
import VeloraMessage from "./velora-message";
import MessageOptions from "./message-options";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            // Render regular message content with markdown support
            <div className="markdown-content break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customize heading styles
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0 text-foreground" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold mt-5 mb-3 first:mt-0 text-foreground" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 first:mt-0 text-foreground" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="text-base font-semibold mt-3 mb-2 first:mt-0 text-foreground" {...props} />
                  ),
                  // Customize list styles
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 my-3 space-y-1.5 text-foreground" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 my-3 space-y-1.5 text-foreground" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-1.5 leading-relaxed" {...props} />
                  ),
                  // Customize paragraph styles
                  p: ({ node, ...props }) => (
                    <p className="my-3 leading-relaxed text-foreground" {...props} />
                  ),
                  // Customize code blocks
                  code: ({ node, className, children, ...props }: any) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto my-3">
                        <code className="text-foreground" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  // Customize links
                  a: ({ node, ...props }: any) => (
                    <a className="text-primary hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  // Customize blockquotes
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground" {...props} />
                  ),
                  // Customize horizontal rules
                  hr: ({ node, ...props }) => (
                    <hr className="my-6 border-border" {...props} />
                  ),
                  // Customize strong/bold
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  // Customize emphasis/italic
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                  // Customize table
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-border" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-border px-4 py-2" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
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