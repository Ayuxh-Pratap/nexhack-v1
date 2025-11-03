"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Share2, Heart, Check } from "lucide-react";
import { toast } from "sonner";

interface MessageOptionsProps {
  messageId: string;
  content: string;
  className?: string;
}

const MessageOptions = ({ messageId, content, className }: MessageOptionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success("Message copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Velora Chat Message",
          text: content,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(content);
        toast.success("Message copied to clipboard for sharing!");
      }
    } catch (error) {
      toast.error("Failed to share message");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/50",
      className
    )}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={cn(
          "p-1.5 rounded-md transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50",
          isCopied && "text-green-600 bg-green-100 dark:bg-green-900/20"
        )}
        title="Copy message"
      >
        {isCopied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className={cn(
          "p-1.5 rounded-md transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
        )}
        title="Share message"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={cn(
          "p-1.5 rounded-md transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50",
          isLiked && "text-red-500 bg-red-100 dark:bg-red-900/20"
        )}
        title={isLiked ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-3.5 h-3.5 transition-all duration-200",
            isLiked && "fill-current"
          )}
        />
      </button>
    </div>
  );
};

export default MessageOptions;