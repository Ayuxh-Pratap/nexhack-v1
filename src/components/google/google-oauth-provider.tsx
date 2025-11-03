"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

interface GoogleOAuthProviderWrapperProps {
    children: ReactNode;
}

export function GoogleOAuthProviderWrapper({ children }: GoogleOAuthProviderWrapperProps) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (!clientId) {
        console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Calendar integration will not work.");
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}

