"use client";

import { useEffect, useRef } from "react";
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
    const hasCheckedRef = useRef(false);

    // Check auth state on mount (only once)
    useEffect(() => {
        // Only check if we haven't checked before and user is not already set
        if (!hasCheckedRef.current && !authState.user && authState.isLoading) {
            hasCheckedRef.current = true;
        dispatch(checkAuthState());
        }
    }, [dispatch, authState.user, authState.isLoading]);

    return {
        user: authState.user,
        isLoading: authState.isLoading,
        error: authState.error,
        isAuthenticated: authState.isAuthenticated,
        firebaseToken: authState.firebaseToken,
        backendToken: authState.backendToken,
    };
};

