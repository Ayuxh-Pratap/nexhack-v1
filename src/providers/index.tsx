"use client";
import { useEffect, useState } from "react";

import { ReduxProvider } from "@/lib/store/ReduxProvider";
import { GoogleOAuthProviderWrapper } from "@/components/google/google-oauth-provider";

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
      <GoogleOAuthProviderWrapper>
        {children}
      </GoogleOAuthProviderWrapper>
    </ReduxProvider>
  );
};