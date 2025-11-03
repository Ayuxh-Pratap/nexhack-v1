import { AIProvider, AIMessage, AIResponse, AIConfig } from './types';
import { GeminiService, DEFAULT_SYSTEM_PROMPT } from './gemini';

export class AIManager {
  private providers: Map<string, AIProvider> = new Map();
  private defaultConfig: AIConfig;

  constructor() {
    this.defaultConfig = {
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: DEFAULT_SYSTEM_PROMPT
    };

    // Initialize default provider
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Gemini provider
    const geminiService = new GeminiService(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDkuvz0JFpH_V22au5DLnup7vqApsWlGAY'
    );
    
    this.providers.set('gemini', {
      generateResponse: async (messages: AIMessage[], systemPrompt?: string) => {
        return await geminiService.generateResponse(messages, systemPrompt);
      },
      generateStreamingResponse: async (messages: AIMessage[], systemPrompt?: string, onChunk?: (chunk: string) => void) => {
        return await geminiService.generateStreamingResponse(messages, systemPrompt, onChunk);
      }
    });
  }

  async generateResponse(
    messages: AIMessage[],
    config?: Partial<AIConfig>
  ): Promise<AIResponse> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const provider = this.providers.get(finalConfig.provider);

    if (!provider) {
      return {
        success: false,
        error: `AI provider '${finalConfig.provider}' not found`
      };
    }

    try {
      return await provider.generateResponse(
        messages,
        finalConfig.systemPrompt
      );
    } catch (error) {
      console.error('AI Manager error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateStreamingResponse(
    messages: AIMessage[],
    config?: Partial<AIConfig>,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const provider = this.providers.get(finalConfig.provider);

    if (!provider) {
      return {
        success: false,
        error: `AI provider '${finalConfig.provider}' not found`
      };
    }

    try {
      return await provider.generateStreamingResponse(
        messages,
        finalConfig.systemPrompt,
        onChunk
      );
    } catch (error) {
      console.error('AI Manager streaming error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Helper method to format messages for AI
  formatMessagesForAI(messages: Array<{ role: string; content: string }>): AIMessage[] {
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Update default configuration
  updateDefaultConfig(config: Partial<AIConfig>) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

// Create singleton instance
export const aiManager = new AIManager();
