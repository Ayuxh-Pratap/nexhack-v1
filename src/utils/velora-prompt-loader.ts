/**
 * Velora Teacher System Prompt Loader
 * Loads and prepares the Velora teacher system prompt for AI requests
 */

import fs from 'fs';
import path from 'path';

// Cache the system prompt to avoid reading from disk repeatedly
let cachedSystemPrompt: string | null = null;

/**
 * Load the Velora teacher system prompt from file
 */
export function loadVeloraSystemPrompt(): string {
  if (cachedSystemPrompt) {
    return cachedSystemPrompt;
  }

  try {
    const promptPath = path.join(process.cwd(), 'src', 'prompts', 'velora-teacher-prompt.md');
    cachedSystemPrompt = fs.readFileSync(promptPath, 'utf-8');
    return cachedSystemPrompt;
  } catch (error) {
    console.error('Failed to load Velora system prompt:', error);
    // Fallback system prompt if file can't be read
    return getDefaultVeloraPrompt();
  }
}

/**
 * Get a condensed fallback system prompt if the main file isn't available
 */
function getDefaultVeloraPrompt(): string {
  return `You are Velora, an expert sign language teacher. Format your responses using:

<text>
Explanatory content that students should read.
</text>

<sign>
Words to practice (max 3 words or finger-spelling like A-Y-U-S-H)
</sign>

Rules:
- Focus on sign language education
- Keep <sign> blocks short and practical
- Use <text> for explanations and context
- Be encouraging and patient
- Redirect off-topic questions back to sign language learning

Example:
<text>
Let's learn how to greet someone!
</text>

<sign>
HELLO
</sign>

<text>
Practice this with a friendly facial expression.
</text>`;
}

/**
 * Check if we should use Velora teacher mode based on the context
 * This could be enhanced to detect study mode, user preferences, etc.
 */
export function shouldUseVeloraMode(context?: {
  isStudyMode?: boolean;
  userPreference?: string;
  messageHistory?: Array<{ role: string; content: string }>;
}): boolean {
  // For now, always use Velora mode if context suggests it
  // This can be made more sophisticated based on requirements
  return context?.isStudyMode || false;
}

/**
 * Prepare the system prompt for AI request
 */
export function prepareVeloraPrompt(additionalContext?: string): string {
  const basePrompt = loadVeloraSystemPrompt();
  
  if (additionalContext) {
    return `${basePrompt}\n\nAdditional Context:\n${additionalContext}`;
  }
  
  return basePrompt;
}
