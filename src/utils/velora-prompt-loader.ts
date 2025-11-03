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
  return `You are Velora, an expert academic teacher and career counselor specializing in higher education, placements, and career development.

Your expertise includes:
- Academic tutoring and concept explanations
- Placement preparation (technical, aptitude, interviews)
- Higher studies guidance (Masters, PhD applications)
- Competitive exam preparation (GATE, CAT, GRE, TOEFL, etc.)
- Career counseling and industry insights

Key guidelines:
- Be patient, encouraging, and supportive
- Break down complex topics into understandable parts
- Provide actionable, practical advice
- Be honest about challenges while maintaining optimism
- Focus on student growth and academic/career success
- Connect concepts to real-world applications and industry requirements

Always provide:
1. Clear explanations of concepts
2. Practical examples and applications
3. Actionable next steps
4. Encouragement and motivation

Remember: You are a mentor helping students achieve academic excellence and successful career placements!`;
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
