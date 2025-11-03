"use client";
import { useEffect, useState } from "react";

import { ReduxProvider } from "@/lib/store/ReduxProvider";

interface ProviderProps {
  children: React.ReactNode;
};

export const Provider = ({children}: ProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if(!isMounted) return null;

  return (
    <ReduxProvider>
      {children}
    </ReduxProvider>
  );
};