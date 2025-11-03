import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
    signInWithPopup, 
    signOut as firebaseSignOut, 
    onAuthStateChanged, 
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { tokenService } from "@/services/tokenService";
import { authApi } from "./authApi";
import { setUser, setFirebaseToken, setBackendToken, clearAuth, setLoading, setError } from "./authSlice";
import type { AppDispatch } from "@/lib/store";
import type { User, UserRole } from "@/types/auth";
import { getDeviceData } from "@/utils/device-utils";

// Helper: Convert Firebase user to app User type
const firebaseUserToUser = (firebaseUser: FirebaseUser, role?: UserRole): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || undefined,
    avatar: firebaseUser.photoURL || undefined,
    emailVerified: firebaseUser.emailVerified,
    role,
});

// Sign in with Google
export const signInWithGoogle = createAsyncThunk(
    "auth/signInWithGoogle",
    async (role: UserRole, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            // Firebase Google sign-in
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            const firebaseToken = await firebaseUser.getIdToken();

            // Convert to app User type
            const user = firebaseUserToUser(firebaseUser, role);

            // Get device data (async - FCM token may take time)
            const deviceData = await getDeviceData();

            // Authenticate with backend API
            const authResult = await dispatch(
                authApi.endpoints.authenticate.initiate({
                    user_type: role,
                    body: {
                        firebase_token: firebaseToken,
                        device_data: deviceData,
                    },
                })
            ).unwrap();

            const backendToken = authResult.access_token;

            // Store tokens
            tokenService.setTokens(firebaseToken, backendToken);

            // Update Redux state
            dispatch(setUser(user));
            dispatch(setFirebaseToken(firebaseToken));
            dispatch(setBackendToken(backendToken));

            dispatch(setLoading(false));
            return { user, firebaseToken, backendToken };
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error?.message || error?.data?.message || "Sign in failed";
            dispatch(setError(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);

// Sign up with email and password
export const signUpWithEmail = createAsyncThunk(
    "auth/signUpWithEmail",
    async (
        { email, password, name, role }: { email: string; password: string; name?: string; role: UserRole },
        { dispatch, rejectWithValue }
    ) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            // Create user with email and password
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = result.user;

            // Update profile with name if provided
            if (name) {
                await updateProfile(firebaseUser, { displayName: name });
            }

            const firebaseToken = await firebaseUser.getIdToken();

            // Convert to app User type
            const user = firebaseUserToUser(firebaseUser, role);

            // Get device data (async - FCM token may take time)
            const deviceData = await getDeviceData();

            // Authenticate with backend API
            const authResult = await dispatch(
                authApi.endpoints.authenticate.initiate({
                    user_type: role,
                    body: {
                        firebase_token: firebaseToken,
                        device_data: deviceData,
                    },
                })
            ).unwrap();

            const backendToken = authResult.access_token;

            // Store tokens
            tokenService.setTokens(firebaseToken, backendToken);

            // Update Redux state
            dispatch(setUser(user));
            dispatch(setFirebaseToken(firebaseToken));
            dispatch(setBackendToken(backendToken));

            dispatch(setLoading(false));
            return { user, firebaseToken, backendToken };
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error?.message || error?.data?.message || "Sign up failed";
            dispatch(setError(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);

// Sign in with email and password
export const signInWithEmail = createAsyncThunk(
    "auth/signInWithEmail",
    async (
        { email, password, role }: { email: string; password: string; role: UserRole },
        { dispatch, rejectWithValue }
    ) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            // Sign in with email and password
            const result = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = result.user;
            const firebaseToken = await firebaseUser.getIdToken();

            // Convert to app User type (preserve existing role or use provided role)
            const user = firebaseUserToUser(firebaseUser, role);

            // Get device data (async - FCM token may take time)
            const deviceData = await getDeviceData();

            // Authenticate with backend API
            const authResult = await dispatch(
                authApi.endpoints.authenticate.initiate({
                    user_type: role,
                    body: {
                        firebase_token: firebaseToken,
                        device_data: deviceData,
                    },
                })
            ).unwrap();

            const backendToken = authResult.access_token;

            // Store tokens
            tokenService.setTokens(firebaseToken, backendToken);

            // Update Redux state
            dispatch(setUser(user));
            dispatch(setFirebaseToken(firebaseToken));
            dispatch(setBackendToken(backendToken));

            dispatch(setLoading(false));
            return { user, firebaseToken, backendToken };
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error?.message || error?.data?.message || "Sign in failed";
            dispatch(setError(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);

// Sign out
export const signOut = createAsyncThunk(
    "auth/signOut",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));

            // Firebase sign out
            await firebaseSignOut(auth);

            // Clear tokens
            tokenService.clearTokens();

            // Clear Redux state
            dispatch(clearAuth());

            dispatch(setLoading(false));
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error?.message || "Sign out failed";
            dispatch(setError(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);

// Check auth state (run on app load)
export const checkAuthState = createAsyncThunk(
    "auth/checkAuthState",
    async (_, { dispatch }) => {
        return new Promise<{ user: User | null; firebaseToken: string | null }>((resolve) => {
            dispatch(setLoading(true));

            onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                        if (firebaseUser) {
                        const firebaseToken = await firebaseUser.getIdToken();
                        // Get role from custom claims or default to student
                        const tokenResult = await firebaseUser.getIdTokenResult();
                        const role = (tokenResult.claims.role as UserRole) || "student";
                        const user = firebaseUserToUser(firebaseUser, role);

                        // Get stored backend token
                        const backendToken = tokenService.getBackendToken();

                        if (backendToken) {
                            dispatch(setUser(user));
                            dispatch(setFirebaseToken(firebaseToken));
                            dispatch(setBackendToken(backendToken));
                        } else {
                            // Authenticate with backend if backend token missing
                            // Get device data (async - FCM token may take time)
                            const deviceData = await getDeviceData();
                            
                            const authResult = await dispatch(
                                authApi.endpoints.authenticate.initiate({
                                    user_type: role,
                                    body: {
                                        firebase_token: firebaseToken,
                                        device_data: deviceData,
                                    },
                                })
                            ).unwrap();

                            const newBackendToken = authResult.access_token;
                            tokenService.setTokens(firebaseToken, newBackendToken);
                            dispatch(setBackendToken(newBackendToken));
                            dispatch(setUser(user));
                            dispatch(setFirebaseToken(firebaseToken));
                        }

                        dispatch(setLoading(false));
                        resolve({ user, firebaseToken });
                    } else {
                        // User not signed in
                        dispatch(clearAuth());
                        dispatch(setLoading(false));
                        resolve({ user: null, firebaseToken: null });
                    }
                } catch (error: any) {
                    dispatch(setLoading(false));
                    dispatch(setError(error?.message || "Auth check failed"));
                    resolve({ user: null, firebaseToken: null });
                }
            });
        });
    }
);

