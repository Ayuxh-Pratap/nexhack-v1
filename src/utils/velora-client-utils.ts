/**
 * Client-side utilities for Velora teacher integration
 */

/**
 * Prepare AI request with Velora teacher context
 */
export function prepareVeloraAIRequest(
  messages: Array<{ role: string; content: string }>,
  config?: {
    provider?: string;
    temperature?: number;
    maxTokens?: number;
    isStudyMode?: boolean;
    chatId?: string;
    useNodeBasedPrompting?: boolean;
  }
) {
  const baseConfig = {
    provider: 'gemini',
    temperature: 0.7,
    maxTokens: 2048,
    ...config
  };

  // If in study mode, add a flag to use Velora teacher prompt
  if (config?.isStudyMode) {
    return {
      messages,
      config: {
        ...baseConfig,
        useVeloraMode: true // Flag for backend to use Velora system prompt
      }
    };
  }

  // If in node mode, enable node-based prompting
  if (config?.useNodeBasedPrompting && config?.chatId) {
    return {
      messages,
      config: {
        ...baseConfig,
        chatId: config.chatId,
        useNodeBasedPrompting: true // Flag for backend to use node-based prompting
      }
    };
  }

  return {
    messages,
    config: baseConfig
  };
}
