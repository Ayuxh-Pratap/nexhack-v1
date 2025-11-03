// User roles
export type UserRole = "teacher" | "student";

// Auth types
export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    emailVerified?: boolean;
    role?: UserRole;
}

export interface AuthState {
    user: User | null;
    firebaseToken: string | null;
    backendToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// API Request types
export interface AuthRequest {
    firebase_token: string;
    device_data: {
        fcm_token?: string;
        timezone: string;
    };
}

// API Response types
export interface AuthResponse {
    status: string;
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface AuthError {
    code: string;
    message: string;
}

