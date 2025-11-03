import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthRequest, AuthResponse, User } from "@/types/auth";
import type { SessionsQueryParams, SessionsResponse } from "@/types/chat";
import { tokenService } from "@/services/tokenService";

// Base API with token injection
const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    prepareHeaders: (headers) => {
        const token = tokenService.getBackendToken();
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

// Auth API slice
export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery,
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        // Authenticate user with Firebase token
        // user_type is passed as query parameter (teacher or user)
        authenticate: builder.mutation<AuthResponse, { user_type: "teacher" | "user"; body: AuthRequest }>({
            query: ({ user_type, body }) => ({
                url: "/auth",
                method: "POST",
                params: {
                    user_type,
                },
                body,
            }),
        }),
        // Get current user profile
        getCurrentUser: builder.query<User, void>({
            query: () => "/auth/user",
        }),
        // Get user sessions with pagination
        getSessions: builder.query<SessionsResponse, SessionsQueryParams>({
            query: (params) => ({
                url: "/user/sessions",
                params: {
                    page_number: params.page_number,
                    page_size: params.page_size,
                },
            }),
        }),
        // Exchange Google OAuth code for tokens
        exchangeGoogleToken: builder.mutation<{ success: boolean; message?: string }, { code: string }>({
            query: (body) => ({
                url: "/user/token",
                method: "POST",
                body,
            }),
        }),
        // Check Google Calendar connection status
        getGoogleConnectionStatus: builder.query<{ connected: boolean; email?: string }, void>({
            query: () => "/user/google/status",
        }),
    }),
});

export const { 
    useAuthenticateMutation, 
    useGetCurrentUserQuery,
    useGetSessionsQuery,
    useLazyGetSessionsQuery,
    useExchangeGoogleTokenMutation,
    useGetGoogleConnectionStatusQuery,
} = authApi;

