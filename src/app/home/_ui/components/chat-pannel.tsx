"use client";

import { useEffect, useRef, useState, memo } from 'react';
import ChatMessage from './chat-message';
import EmptyState from './empty-state';
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface Props {
  messages: Message[];
  isLoading?: boolean;
  onSignWord?: (word: string) => void;
}

const ChatPannel = ({ messages, isLoading = false, onSignWord }: Props) => {
  const { state } = useSidebar();

  // 🎯 KEY: Scroll management refs
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const showEmpty = messages.length === 0;

  // 🎯 KEY: Smooth scroll to bottom function
  const scrollToBottom = (force = false) => {
    if (!messagesRef.current) return;

    // Don't auto-scroll if user has manually scrolled up (unless forced)
    if (isUserScrolled && !force) return;

    messagesRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  // 🎯 KEY: Check if user has scrolled up manually
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    setIsUserScrolled(!isAtBottom);
    setShowScrollButton(!isAtBottom && messages.length > 0);
  };

  // 🎯 KEY: Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // Dependency: messages.length

  // 🎯 KEY: Auto-scroll during AI loading
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // 🎯 KEY: Scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, []); // Only run once on mount

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className={cn(
        "relative flex flex-col w-full pt-16 pb-24 mx-auto h-full overflow-y-none scroll-smooth",
        // When sidebar is expanded, use smaller max-width for better centering
        state === "expanded"
          ? "md:max-w-2xl lg:max-w-3xl"
          : "md:max-w-4xl lg:max-w-5xl"
      )}
    >
      {/* Fade Effect Overlay - Fixed at top, full width */}
      {/* <div className="fixed top-10 left-0 right-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-20" /> */}

      {showEmpty ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              index={index}
              messages={messages}
              isLoading={isLoading}
              onSignWord={onSignWord}
            />
          ))}

          {/* Loading indicator - appears right after the last user message */}
          {isLoading && (
            <div className="flex gap-x-2 p-2 group/message items-start my-3">
              <div className="relative flex-1 px-1 overflow-hidden">
                <div className="flex flex-col grow">
                  <div className="flex items-center pt-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse" />
                    <span className="ml-2 text-foreground/70 text-sm">thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error state example */}
      {false && (
        <div className="py-4 flex items-center justify-center w-full">
          <div className="flex items-center bg-destructive/10 text-destructive px-4 py-1.5 rounded-lg text-sm">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="ml-2 font-medium">Error message would appear here</p>
          </div>
        </div>
      )}

      {/* 🎯 KEY: The scroll target element */}
      <div ref={messagesRef} className="w-full h-px" />

      {/* 🎯 KEY: Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-32 right-8 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default memo(ChatPannel);