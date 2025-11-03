import { headers } from "next/headers";
import type { User } from "@/types/auth";

/**
 * Server-side session verification using backend token
 * The backend token is verified by the backend API and contains user information
 * For tRPC server-side, we verify with backend API or extract from token
 */
export async function getSession(): Promise<{ user: User } | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get("authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const backendToken = authHeader.split("Bearer ")[1];
        
        if (!backendToken) {
            return null;
        }

        // Verify backend token with backend API
        // The backend API should verify the token and return user info
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const response = await fetch(`${apiUrl}/auth/user`, {
                headers: {
                    authorization: `Bearer ${backendToken}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            const user: User = {
                id: data.user?.id || data.id,
                email: data.user?.email || data.email,
                name: data.user?.name || data.name,
                avatar: data.user?.avatar || data.avatar,
                emailVerified: data.user?.emailVerified || data.emailVerified || false,
                role: (data.user?.user_type || data.user?.role || data.user_type || data.role || "student") as "teacher" | "student",
            };

            return { user };
        } catch (error) {
            console.error("Backend token verification failed:", error);
            return null;
        }
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
}

/**
 * Verify Firebase token (for direct Firebase token verification)
 * Note: This should use the /auth endpoint with user_type query parameter
 * For now, this is a placeholder - actual implementation should use the authenticate endpoint
 */
export async function verifyFirebaseToken(token: string, userType: "teacher" | "student" = "student"): Promise<User | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const response = await fetch(`${apiUrl}/auth?user_type=${userType}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                firebase_token: token,
                device_data: {
                    fcm_token: "",
                    timezone: timezone,
                }
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        // After authentication, we'd need to fetch user profile separately
        // For now, return null as this is primarily for server-side use
        // Client-side should use the authenticate mutation
        return null;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

