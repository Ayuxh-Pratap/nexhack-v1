// Chat mode types
export type ChatMode = 'ova' | 'drive';

export interface ChatModeState {
    mode: ChatMode;
}

// Chat types
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: string;
    chatId?: string;
}

export interface StoredConversation {
    id: string;
    title: string;
    type: 'audio' | 'text';
    transcript: string;
    createdAt: string;
    duration?: number; // for audio conversations
}

// Session types from API
export interface Session {
    session_id: string;
    heading: string;
    date: string;
    total_messages: number;
    pointer: string;
}

export interface SessionsResponse {
    data: Session[];
    total: number;
    active_index: string;
    count: number;
    page_number: number;
    pagination: {
        next: string | null;
        previous: string | null;
    };
}

export interface SessionsQueryParams {
    page_number: number;
    page_size: number;
}

