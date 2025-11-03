"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { checkAuthState } from "@/store/slices/auth/authThunks";
import type { UserRole } from "@/types/auth";

/**
 * Main auth hook - replaces use-session
 * Provides access to Redux auth state and actions
 */
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);

    // Check auth state on mount
    useEffect(() => {
        dispatch(checkAuthState());
    }, [dispatch]);

    return {
        user: authState.user,
        isLoading: authState.isLoading,
        error: authState.error,
        isAuthenticated: authState.isAuthenticated,
        firebaseToken: authState.firebaseToken,
        backendToken: authState.backendToken,
    };
};

