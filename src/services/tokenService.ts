/**
 * Token Service - Manages Firebase and backend tokens in localStorage
 */

const FIREBASE_TOKEN_KEY = "firebase_token";
const BACKEND_TOKEN_KEY = "backend_token";

class TokenService {
    /**
     * Store both Firebase and backend tokens
     */
    setTokens(firebaseToken: string, backendToken: string): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(FIREBASE_TOKEN_KEY, firebaseToken);
            localStorage.setItem(BACKEND_TOKEN_KEY, backendToken);
        }
    }

    /**
     * Get Firebase token from localStorage
     */
    getFirebaseToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(FIREBASE_TOKEN_KEY);
        }
        return null;
    }

    /**
     * Get backend token from localStorage
     */
    getBackendToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(BACKEND_TOKEN_KEY);
        }
        return null;
    }

    /**
     * Clear all tokens
     */
    clearTokens(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(FIREBASE_TOKEN_KEY);
            localStorage.removeItem(BACKEND_TOKEN_KEY);
        }
    }

    /**
     * Check if tokens exist
     */
    hasTokens(): boolean {
        return !!(this.getFirebaseToken() && this.getBackendToken());
    }
}

export const tokenService = new TokenService();

