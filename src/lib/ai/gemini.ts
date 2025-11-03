export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: GeminiMessage[],
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      // For Gemini API, we need to format messages differently
      // Gemini doesn't use role-based messages like OpenAI
      // Instead, we concatenate the conversation into a single prompt
      
      let fullPrompt = '';
      
      // Add system prompt if provided
      if (systemPrompt) {
        fullPrompt += systemPrompt + '\n\n';
      }
      
      // Format conversation history
      messages.forEach((message, index) => {
        if (message.role === 'user') {
          fullPrompt += `User: ${message.content}\n`;
        } else if (message.role === 'assistant') {
          fullPrompt += `Assistant: ${message.content}\n`;
        }
      });
      
      // Add the final prompt for the AI to respond to
      fullPrompt += 'Assistant: ';

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        return {
          success: true,
          content: content.trim()
        };
      } else {
        throw new Error('No response content received from Gemini');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateStreamingResponse(
    messages: GeminiMessage[],
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<GeminiResponse> {
    try {
      // For now, we'll use the regular response and simulate streaming
      // TODO: Implement actual streaming when Gemini supports it
      const response = await this.generateResponse(messages, systemPrompt);
      
      if (response.success && response.content && onChunk) {
        // Simulate streaming by sending chunks
        const words = response.content.split(' ');
        for (let i = 0; i < words.length; i++) {
          onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
          await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between chunks
        }
      }
      
      return response;
    } catch (error) {
      console.error('Gemini streaming error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Default system prompt for chat conversations
export const DEFAULT_SYSTEM_PROMPT = `You are Velora, a knowledgeable medical AI assistant. You provide helpful medical information and guidance while maintaining appropriate professional standards.

Key guidelines:
- Be accurate, evidence-based, and professional
- Use clear, accessible language appropriate for the user
- Provide comprehensive but concise responses
- Draw from your medical knowledge and experience
- Prioritize patient safety in all recommendations
- When appropriate, suggest consultation with qualified healthcare providers for medical concerns
- Be conversational and engaging while maintaining medical professionalism

Current conversation context:`;

// Create singleton instance
export const geminiService = new GeminiService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDkuvz0JFpH_V22au5DLnup7vqApsWlGAY');
