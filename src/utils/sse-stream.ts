/**
 * Utility functions for handling Server-Sent Events (SSE) streams
 */

export interface SSEEvent {
    data: string;
    event?: string;
    id?: string;
}

/**
 * Parse SSE stream data
 */
export async function* parseSSEStream(
    stream: ReadableStream<Uint8Array>
): AsyncGenerator<SSEEvent, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                // Process any remaining buffer
                if (buffer.trim()) {
                    yield* parseSSEBuffer(buffer);
                }
                break;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines (ending with \n\n)
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.trim()) {
                    yield* parseSSEBuffer(line);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Parse SSE buffer into events
 */
function* parseSSEBuffer(buffer: string): Generator<SSEEvent, void, unknown> {
    const lines = buffer.split("\n");
    let event: SSEEvent = { data: "" };

    for (const line of lines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;

        const field = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove surrounding quotes if present (some servers send quoted values)
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        switch (field) {
            case "data":
                event.data = value;
                break;
            case "event":
                event.event = value;
                break;
            case "id":
                event.id = value;
                break;
        }
    }

    if (event.data) {
        yield event;
    }
}

/**
 * Parse JSON chunk and extract content
 */
function parseSSEChunk(data: string): string {
    try {
        // Try to parse as JSON
        const parsed = JSON.parse(data);
        
        // Extract content if it's a structured response
        if (parsed && typeof parsed === 'object') {
            // Handle different response formats
            if (parsed.content !== undefined) {
                return parsed.content;
            }
            if (parsed.text !== undefined) {
                return parsed.text;
            }
            if (parsed.message !== undefined) {
                return parsed.message;
            }
            // If no content field found, return the whole object as string
            return JSON.stringify(parsed);
        }
        
        // If not an object, return as-is
        return String(parsed);
    } catch {
        // If not valid JSON, return as-is
        return data;
    }
}

/**
 * Stream SSE events and call onChunk for each data chunk
 */
export async function streamSSE(
    stream: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
): Promise<void> {
    try {
        for await (const event of parseSSEStream(stream)) {
            if (event.data) {
                // Parse JSON and extract content
                const content = parseSSEChunk(event.data);
                if (content) {
                    onChunk(content);
                }
            }
        }
        onComplete?.();
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
    }
}

