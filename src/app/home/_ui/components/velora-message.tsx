"use client";

import React from 'react';
import { VeloraBlock, extractSignableWords } from '@/utils/velora-parser';
import { cn } from '@/lib/utils';

interface VeloraMessageProps {
  blocks: VeloraBlock[];
  onSignWord: (word: string) => void;
  className?: string;
}

interface ClickableTextProps {
  text: string;
  onSignWord: (word: string) => void;
}

/**
 * Renders text with clickable words that can be signed
 */
const ClickableText: React.FC<ClickableTextProps> = ({ text, onSignWord }) => {
  const signableWords = extractSignableWords(text);
  
  if (signableWords.length === 0) {
    return <span>{text}</span>;
  }
  
  // Split text into parts and make signable words clickable
  const parts: React.ReactNode[] = [];
  let remainingText = text;
  
  signableWords.forEach((word, index) => {
    // Find the word in the remaining text (case-insensitive)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    const match = remainingText.match(regex);
    
    if (match && match.index !== undefined) {
      // Add text before the word
      if (match.index > 0) {
        parts.push(
          <span key={`before-${index}`}>
            {remainingText.slice(0, match.index)}
          </span>
        );
      }
      
      // Add the clickable word with normal appearance, highlight only on hover
      parts.push(
        <button
          key={`word-${index}`}
          onClick={() => onSignWord(word)}
          className={cn(
            "inline text-inherit cursor-pointer transition-all duration-200",
            "hover:text-accent-foreground hover:underline hover:decoration-dotted hover:bg-accent/20",
            "px-0.5 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
          )}
          title={`Click to see how to sign "${word}"`}
          type="button"
        >
          {match[0]}
        </button>
      );
      
      // Update remaining text
      remainingText = remainingText.slice(match.index + match[0].length);
    }
  });
  
  // Add any remaining text
  if (remainingText) {
    parts.push(<span key="remaining">{remainingText}</span>);
  }
  
  return <>{parts}</>;
};

/**
 * Renders a single Velora block (text or sign)
 */
const VeloraBlockComponent: React.FC<{
  block: VeloraBlock;
  onSignWord: (word: string) => void;
}> = ({ block, onSignWord }) => {
  if (block.type === 'text') {
    return (
      <div className="mb-3 last:mb-0">
        <ClickableText text={block.content} onSignWord={onSignWord} />
      </div>
    );
  }
  
  if (block.type === 'sign') {
    return (
      <div className="mb-3 last:mb-0">
        <div className="bg-accent/20 dark:bg-accent/10 border-l-4 border-accent p-3 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a1 1 0 001 1h8a1 1 0 001 1V8M9 8h6" />
            </svg>
            <span className="text-sm text-accent-foreground font-medium">Sign this:</span>
          </div>
          <button
            onClick={() => onSignWord(block.content)}
            className={cn(
              "text-lg font-semibold text-foreground hover:text-accent-foreground",
              "hover:bg-accent/30 dark:hover:bg-accent/20 px-2 py-1 rounded transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50",
              "block w-full text-left"
            )}
            title={`Click to see how to sign "${block.content}"`}
            type="button"
          >
            {block.content}
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

/**
 * Main Velora Message Component
 * Renders parsed Velora response with clickable sign words
 */
const VeloraMessage: React.FC<VeloraMessageProps> = ({ 
  blocks, 
  onSignWord, 
  className 
}) => {
  if (blocks.length === 0) {
    return (
      <div className={cn("text-gray-500 italic", className)}>
        No content to display
      </div>
    );
  }
  
  return (
    <div className={cn("velora-message", className)}>
      {blocks.map((block) => (
        <VeloraBlockComponent
          key={block.id}
          block={block}
          onSignWord={onSignWord}
        />
      ))}
    </div>
  );
};

export default VeloraMessage;