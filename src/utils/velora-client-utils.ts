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

  // Velora teacher mode is now default for all conversations
  // Priority: Node-based > Velora mode > Default
  const finalConfig: any = {
        ...baseConfig,
    useVeloraMode: true // Always use Velora teacher prompt by default
    };

  // If in node mode, enable node-based prompting (takes priority)
  if (config?.useNodeBasedPrompting && config?.chatId) {
    finalConfig.chatId = config.chatId;
    finalConfig.useNodeBasedPrompting = true; // This will override Velora mode in AI router
  }

  return {
    messages,
    config: finalConfig
  };
}
