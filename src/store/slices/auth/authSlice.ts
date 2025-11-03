import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/auth";

const initialState: AuthState = {
    user: null,
    firebaseToken: null,
    backendToken: null,
    isLoading: true, // Initialize as true for optimistic loading
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setFirebaseToken: (state, action: PayloadAction<string | null>) => {
            state.firebaseToken = action.payload;
        },
        setBackendToken: (state, action: PayloadAction<string | null>) => {
            state.backendToken = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearAuth: (state) => {
            state.user = null;
            state.firebaseToken = null;
            state.backendToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.isLoading = false; // Set to false when clearing auth
        },
    },
});

export const { setUser, setFirebaseToken, setBackendToken, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;

