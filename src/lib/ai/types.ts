export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface AIProvider {
  generateResponse(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse>;
  
  generateStreamingResponse(
    messages: AIMessage[],
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse>;
}

export interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
