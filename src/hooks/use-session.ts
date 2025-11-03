"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const useSession = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Get session data
    const getSession = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const session = await authClient.getSession();
            console.log(session.data?.user);

            if (session.data?.user) {
                setUser(session.data.user as User);
            } else {
                setUser(null);
            }
        } catch (err) {
            setError(err as Error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Sign out function
    const signOut = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            setError(null);
        } catch (err) {
            setError(err as Error);
        }
    };

    // Initialize session on mount
    useEffect(() => {
        getSession();
    }, []);

    // Debug: Log when user state changes
    useEffect(() => {
        console.log("useSession user state changed:", user);
    }, [user]);

    return {
        user,
        isLoading,
        error,
        signOut,
        getSession,
    };
};
