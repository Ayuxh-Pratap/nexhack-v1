"use client";

import { useState, useCallback, useRef } from "react";
import { tokenService } from "@/services/tokenService";
import { streamSSE } from "@/utils/sse-stream";
import { toast } from "sonner";

interface UseChatStreamOptions {
    onChunk?: (chunk: string) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Custom hook for streaming chat responses using SSE
 * Directly uses fetch API for SSE streaming (RTK Query doesn't support streaming natively)
 */
export const useChatStream = (options?: UseChatStreamOptions) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        async (query: string, video_url?: string | null) => {
            if (isStreaming) {
                console.warn("Already streaming, please wait...");
                return;
            }

            // Abort any existing stream
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setIsStreaming(true);
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                const token = tokenService.getBackendToken();
                let apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

                if (!apiUrl) {
                    throw new Error("NEXT_PUBLIC_API_URL is not set");
                }

                // Remove trailing slash from API URL to avoid double slashes
                apiUrl = apiUrl.replace(/\/+$/, "");

                // Build query parameters
                const params = new URLSearchParams();
                params.append("query", query.trim());
                
                // Add video_url if provided (YouTube link of the lecture)
                if (video_url) {
                    params.append("video_url", video_url);
                }

                // Make request with streaming
                const url = `${apiUrl}/chat?${params.toString()}`;
                console.log("Chat request URL:", url); // Debug log

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "authorization": token ? `Bearer ${token}` : "",
                        "accept": "text/event-stream",
                    },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`Chat request failed: ${response.statusText}`);
                }

                if (!response.body) {
                    throw new Error("Response body is null");
                }

                // Stream the SSE response
                await streamSSE(
                    response.body,
                    (chunk: string) => {
                        options?.onChunk?.(chunk);
                    },
                    (error: Error) => {
                        // Don't show error if it's an abort
                        if (error.name !== "AbortError") {
                            console.error("Stream error:", error);
                            options?.onError?.(error);
                            toast.error("Error streaming response");
                        }
                        setIsStreaming(false);
                    },
                    () => {
                        options?.onComplete?.();
                        setIsStreaming(false);
                        abortControllerRef.current = null;
                    }
                );
            } catch (error: any) {
                // Don't show error if it's an abort
                if (error.name !== "AbortError") {
                    console.error("Chat request error:", error);
                    const errorMessage = error?.message || "Failed to send message";
                    toast.error(errorMessage);
                    options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
                }
                setIsStreaming(false);
                abortControllerRef.current = null;
            }
        },
        [isStreaming, options]
    );

    const cancelStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    }, []);

    return {
        sendMessage,
        isStreaming,
        cancelStream,
    };
};

