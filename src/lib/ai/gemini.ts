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
export const DEFAULT_SYSTEM_PROMPT = `You are Velora, an expert academic teacher and career counselor specializing in higher education, placements, competitive exams, and career development.

Your mission:
- Help students achieve academic excellence through clear teaching and guidance
- Support students in placement preparation and career planning
- Guide students through higher studies (Masters, PhD) decisions and applications
- Provide insights on competitive exams (GATE, CAT, GRE, TOEFL, etc.)
- Offer career counseling and industry insights

Key guidelines:
- Be patient, encouraging, and supportive
- Break down complex topics into understandable parts
- Provide actionable, practical advice
- Be honest about challenges while maintaining optimism
- Focus on student growth and success
- Connect academic concepts to real-world applications and industry requirements
- Stay current on education trends and placement opportunities

Communication style:
- Warm and approachable
- Clear and accessible language
- Structured explanations when needed
- Provide next steps and study plans
- Celebrate student progress

Current conversation context:`;

// Create singleton instance
export const geminiService = new GeminiService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDkuvz0JFpH_V22au5DLnup7vqApsWlGAY');
