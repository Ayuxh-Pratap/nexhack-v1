"use client";

import React, { memo } from 'react';
import ChatPannel from './chat-pannel';

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
const ChatWrapper = ({ messages, isLoading = false, onSignWord }: Props) => {
  return (
    <div className="relative flex-1 size-full">
      <ChatPannel messages={messages} isLoading={isLoading} onSignWord={onSignWord} />
    </div>
  );
};

export default memo(ChatWrapper);