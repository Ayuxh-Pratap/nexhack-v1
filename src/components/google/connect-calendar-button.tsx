"use client";

import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { useExchangeGoogleTokenMutation, useGetGoogleConnectionStatusQuery } from "@/store/slices/auth/authApi";
import { toast } from "sonner";

interface ConnectCalendarButtonProps {
    onSuccess?: () => void;
    isConnected?: boolean;
}

// Google OAuth scopes for Calendar and Gmail
const GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
].join(" ");

export function ConnectCalendarButton({ onSuccess, isConnected: propIsConnected = false }: ConnectCalendarButtonProps) {
    const [exchangeToken, { isLoading: isExchanging }] = useExchangeGoogleTokenMutation();
    const { data: connectionStatus, isLoading: isLoadingStatus } = useGetGoogleConnectionStatusQuery(undefined, {
        skip: propIsConnected, // Skip query if explicitly provided
    });
    
    const isConnected = propIsConnected || connectionStatus?.connected || false;
    const loading = isExchanging || isLoadingStatus;

    const login = useGoogleLogin({
        flow: "auth-code",
        scope: GOOGLE_SCOPES,
        onSuccess: async (response) => {
            try {
                // Exchange authorization code for tokens via backend
                await exchangeToken({ code: response.code }).unwrap();
                
                toast.success("Google Calendar connected successfully!");
                onSuccess?.();
            } catch (error: any) {
                console.error("Google Calendar connection error:", error);
                const errorMessage = error?.data?.message || error?.message || "Failed to connect Google Calendar";
                toast.error(errorMessage);
            }
        },
        onError: () => {
            toast.error("Google sign-in failed");
        },
    });

    if (isConnected) {
        return (
            <Button
                variant="outline"
                className="w-full justify-start"
                disabled
            >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Google Calendar Connected
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => login()}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                </>
            ) : (
                <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Google Calendar
                </>
            )}
        </Button>
    );
}

