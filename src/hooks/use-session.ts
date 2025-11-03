"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import { signOut as signOutThunk } from "@/store/slices/auth/authThunks";
import { useAuth } from "./use-auth";
import { useRouter } from "next/navigation";

/**
 * useSession hook - maintained for backward compatibility
 * Now uses Redux auth state under the hood
 */
export const useSession = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isLoading, error } = useAuth();

    const signOut = async () => {
        try {
            await dispatch(signOutThunk()).unwrap();
            router.push("/login");
        } catch (err) {
            console.error("Sign out error:", err);
        }
    };

    return {
        user: user ? {
            id: user.id,
            name: user.name || "",
            email: user.email,
            emailVerified: user.emailVerified || false,
            image: user.avatar || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } : null,
        isLoading,
        error,
        signOut,
    };
};
