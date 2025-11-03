"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import ChatList from "./chat-list";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props {
  // UI-only props
}

const DesktopSidebar = ({}: Props) => {
  const [isOpen] = useState(true);

  return (
    <div
      id="sidebar"
      className={cn(
        "flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-[99] bg-muted/20 backdrop-blur-lg border-r transition-all duration-300 ease-in-out",
        isOpen ? "w-68 border-border/60" : "w-0 border-r-0 border-transparent",
      )}
    >
      <div
        className={cn(
          "flex flex-col size-full transition-opacity duration-300 ease-in-out",
          isOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        )}
        style={{
          visibility: isOpen ? "visible" : "hidden"
        }}
      >
        <ChatList />
      </div>
    </div>
  );
};

export default DesktopSidebar;
