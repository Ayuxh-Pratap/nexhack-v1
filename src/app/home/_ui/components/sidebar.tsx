"use client";

import { cn } from "@/lib/utils";
import React, { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends React.ComponentProps<'div'> {
  // UI-only props
}

const Sidebar = ({ className, children }: Props) => {
  const [isOpen] = useState(true);

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={cn("h-full flex-col", className)}
    >
      {children}
    </div>
  );
};

export default Sidebar;