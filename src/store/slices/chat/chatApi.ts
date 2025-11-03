import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

// Chat API slice
export const chatApi = createApi({
    reducerPath: "chatApi",
    baseQuery,
    tagTypes: ["Chat"],
    endpoints: (builder) => ({
        // Chat with chatbot - SSE streaming
        chat: builder.mutation<ReadableStream<Uint8Array>, { query: string; lecture_id?: string | null }>({
            queryFn: async ({ query, lecture_id }, _queryApi, _extraOptions, fetchWithBQ) => {
                try {
                    const token = tokenService.getBackendToken();
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                    
                    if (!apiUrl) {
                        throw new Error("NEXT_PUBLIC_API_URL is not set");
                    }

                    // Build query parameters
                    const params = new URLSearchParams();
                    params.append("query", query);
                    if (lecture_id) {
                        params.append("lecture_id", lecture_id);
                    }

                    // Make request with streaming
                    const response = await fetch(`${apiUrl}/chat?${params.toString()}`, {
                        method: "POST",
                        headers: {
                            "authorization": token ? `Bearer ${token}` : "",
                            "accept": "text/event-stream",
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Chat request failed: ${response.statusText}`);
                    }

                    if (!response.body) {
                        throw new Error("Response body is null");
                    }

                    return { data: response.body };
                } catch (error: any) {
                    return {
                        error: {
                            status: "FETCH_ERROR",
                            error: error.message || "Failed to start chat stream",
                        },
                    };
                }
            },
        }),
    }),
});

export const { useChatMutation } = chatApi;

