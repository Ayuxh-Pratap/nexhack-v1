"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/components/ui/sidebar";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from "sonner";

interface Props {
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  isStudyMode?: boolean;
  onToggleStudyMode?: () => void;
  isNodeMode?: boolean;
  onToggleNodeMode?: () => void;
}

const ChatInput = ({ onSendMessage, isLoading = false, isStudyMode = false, onToggleStudyMode, isNodeMode = false, onToggleNodeMode }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const { state } = useSidebar();

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Handle speech recognition start/stop
  const handleSpeechToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      toast.success("Voice recording stopped");
    } else {
      if (!browserSupportsSpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser");
        return;
      }
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      toast.success("Voice recording started - speak now!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Send the message
    onSendMessage?.(trimmedInput);

    // Clear the input
    setInput("");

    // Focus back to the textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // Handle mode toggles with mutual exclusivity
  const handleStudyModeToggle = () => {
    if (isNodeMode && onToggleNodeMode) {
      onToggleNodeMode(); // Turn off node mode first
    }
    onToggleStudyMode?.();
  };

  const handleNodeModeToggle = () => {
    if (isStudyMode && onToggleStudyMode) {
      onToggleStudyMode(); // Turn off study mode first
    }
    onToggleNodeMode?.();
  };

  return (
    <div className="fixed bottom-0 transition-all duration-200 ease-linear z-40"
      style={{
        left: state === "expanded" ? "16rem" : "0",
        right: "0"
      }}>
      <div className="px-3 text-base pb-4 md:px-5 lg:px-1 xl:px-5">

        <div className={cn(
          "flex flex-1 gap-4 mx-auto text-base md:gap-5 lg:gap-6 transition-all duration-200 ease-linear",
          // When sidebar is expanded, use smaller max-width for better centering
          state === "expanded"
            ? "md:max-w-2xl lg:max-w-3xl"
            : "md:max-w-4xl lg:max-w-5xl"
        )}>

          <form
            onSubmit={handleSubmit}
            className="relative w-full"
          >
            <div className="relative w-full gap-x-1.5 rounded-xl p-1 transition-colors bg-background border border-border/60 overflow-y-auto flex flex-col z-0">

              {/* File upload preview area */}
              <div className="hidden">
                {/* File previews would go here */}
              </div>

              <div className="relative flex flex-col justify-center flex-1 min-w-0">
                <Textarea
                  rows={1}
                  tabIndex={0}
                  value={input}
                  autoFocus={true}
                  ref={textareaRef}
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isStudyMode 
                      ? "Type a message for sign language translation..." 
                      : isNodeMode 
                        ? "Type a message for your medical specialist team..."
                        : "Type a message..."
                  }
                  className={cn(
                    "h-auto pl-4 mb-12 overflow-y-auto bg-transparent border-0 resize-none text-left focus:outline-none min-h-12 max-h-22 w-full ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  )}
                />
              </div>

              {/* Mode toggle buttons */}
              <div className="absolute left-2 bottom-2 z-20 flex gap-1">
                {/* Study Mode Button */}
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={handleStudyModeToggle}
                  className={cn(
                    "active:scale-90 transition-all duration-200",
                    isStudyMode
                      ? "bg-accent text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                      : "hover:bg-accent"
                  )}
                  title={isStudyMode ? "Exit Study Mode" : "Enter Study Mode"}
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </Button>

                {/* Node Mode Button */}
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={handleNodeModeToggle}
                  className={cn(
                    "active:scale-90 transition-all duration-200",
                    isNodeMode
                      ? "bg-accent text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                      : "hover:bg-accent"
                  )}
                  title={isNodeMode ? "Exit Node Mode" : "Enter Node Mode"}
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </Button>

                {/* File upload button */}
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  className="active:scale-90"
                >
                  <label
                    htmlFor="file"
                    className="size-full flex items-center justify-center cursor-pointer"
                  >
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.txt"
                    />
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                </Button>
              </div>

              {/* Send button */}
              <div className="absolute right-2 bottom-2 z-20">
                <Button
                  size="icon"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="active:scale-90"
                >
                  {isLoading ? (
                    <svg className="size-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </Button>
              </div>

              {/* Voice recording button */}
              <div className="absolute bottom-2 right-12 z-20 flex gap-x-2">
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={handleSpeechToggle}
                  className={cn(
                    "relative transition-all duration-200 active:scale-90",
                    listening && "bg-red-500 text-white hover:bg-red-600"
                  )}
                  title={listening ? "Stop voice recording" : "Start voice recording"}
                >
                  {listening ? (
                    // Recording indicator with pulsing animation
                    <div className="relative">
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                    </div>
                  ) : (
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </Button>

                {/* Clear transcript button - only show when there's a transcript */}
                {transcript && (
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    disabled={isLoading}
                    onClick={() => {
                      resetTranscript();
                      setInput("");
                      toast.success("Voice input cleared");
                    }}
                    className="transition-all duration-200 active:scale-90"
                    title="Clear voice input"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;