/**
 * Velora Response Parser
 * Parses LLM responses with <text> and <sign> markup into structured data
 */

export interface VeloraBlock {
  type: 'text' | 'sign';
  content: string;
  id: string; // Unique identifier for React keys
}

export interface ParsedVeloraResponse {
  blocks: VeloraBlock[];
  allSignContent: string[]; // All sign content for batch animation
  hasSignContent: boolean;
}

/**
 * Parse Velora teacher response with <text> and <sign> markup
 */
export function parseVeloraResponse(response: string): ParsedVeloraResponse {
  const blocks: VeloraBlock[] = [];
  const allSignContent: string[] = [];
  
  // Remove any leading/trailing whitespace
  const cleanResponse = response.trim();
  
  // Regular expression to match <text> and <sign> blocks
  const blockRegex = /<(text|sign)>([\s\S]*?)<\/\1>/gi;
  
  let lastIndex = 0;
  let match;
  let blockCounter = 0;
  
  while ((match = blockRegex.exec(cleanResponse)) !== null) {
    const [fullMatch, blockType, content] = match;
    const startIndex = match.index;
    
    // If there's unmatched content before this block, add it as text
    if (startIndex > lastIndex) {
      const unmatchedContent = cleanResponse.slice(lastIndex, startIndex).trim();
      if (unmatchedContent) {
        blocks.push({
          type: 'text',
          content: unmatchedContent,
          id: `unmatched-${blockCounter++}`
        });
      }
    }
    
    // Add the matched block
    const cleanContent = content.trim();
    if (cleanContent) {
      blocks.push({
        type: blockType as 'text' | 'sign',
        content: cleanContent,
        id: `${blockType}-${blockCounter++}`
      });
      
      // Collect sign content for animation
      if (blockType === 'sign') {
        allSignContent.push(cleanContent);
      }
    }
    
    lastIndex = blockRegex.lastIndex;
  }
  
  // If there's unmatched content after the last block, add it as text
  if (lastIndex < cleanResponse.length) {
    const unmatchedContent = cleanResponse.slice(lastIndex).trim();
    if (unmatchedContent) {
      blocks.push({
        type: 'text',
        content: unmatchedContent,
        id: `unmatched-final-${blockCounter}`
      });
    }
  }
  
  // If no blocks were found, treat the entire response as text
  if (blocks.length === 0 && cleanResponse) {
    blocks.push({
      type: 'text',
      content: cleanResponse,
      id: 'fallback-text'
    });
  }
  
  return {
    blocks,
    allSignContent,
    hasSignContent: allSignContent.length > 0
  };
}

/**
 * Extract words from text that could be signed individually
 * Used for making words clickable in text blocks
 */
export function extractSignableWords(text: string): string[] {
  // Remove punctuation and split into words
  const words = text
    .replace(/[^\w\s-]/g, ' ') // Replace punctuation with spaces, keep hyphens
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.toUpperCase());
  
  // Filter out common words that probably shouldn't be signed individually
  const commonWords = new Set([
    'THE', 'A', 'AN', 'AND', 'OR', 'BUT', 'TO', 'OF', 'IN', 'ON', 'AT', 'BY', 'FOR',
    'WITH', 'FROM', 'AS', 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
    'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'COULD', 'SHOULD',
    'CAN', 'MAY', 'MIGHT', 'MUST', 'SHALL'
  ]);
  
  return words.filter(word => !commonWords.has(word) && word.length > 1);
}

/**
 * Validate sign content to ensure it meets teaching guidelines
 */
export function validateSignContent(content: string): {
  isValid: boolean;
  wordCount: number;
  warnings: string[];
} {
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;
  const warnings: string[] = [];
  
  // Check word count (max 3 words or 1 finger-spelled item)
  const isFingerSpelled = content.includes('-');
  const maxWords = isFingerSpelled ? 1 : 3;
  
  if (wordCount > maxWords) {
    warnings.push(`Sign block has ${wordCount} words but should have max ${maxWords}`);
  }
  
  // Check for overly long content
  if (content.length > 50) {
    warnings.push('Sign content is very long and may be hard to animate');
  }
  
  // Check for punctuation (except hyphens for finger-spelling)
  if (/[^\w\s-]/.test(content)) {
    warnings.push('Sign content contains punctuation that may not animate properly');
  }
  
  return {
    isValid: warnings.length === 0,
    wordCount,
    warnings
  };
}

/**
 * Fallback parser for responses that don't use markup
 * Attempts to intelligently split content into teachable chunks
 */
export function fallbackParseResponse(response: string): ParsedVeloraResponse {
  const blocks: VeloraBlock[] = [];
  const allSignContent: string[] = [];
  
  // Split by sentences
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (trimmed) {
      // Try to identify if this sentence contains key vocabulary
      const signableWords = extractSignableWords(trimmed);
      
      if (signableWords.length > 0 && signableWords.length <= 3) {
        // If it's a short sentence with key vocabulary, make it signable
        blocks.push({
          type: 'text',
          content: `Here's how to sign: ${trimmed}`,
          id: `fallback-intro-${index}`
        });
        
        blocks.push({
          type: 'sign',
          content: signableWords.join(' '),
          id: `fallback-sign-${index}`
        });
        
        allSignContent.push(signableWords.join(' '));
      } else {
        // Regular text content
        blocks.push({
          type: 'text',
          content: trimmed,
          id: `fallback-text-${index}`
        });
      }
    }
  });
  
  return {
    blocks,
    allSignContent,
    hasSignContent: allSignContent.length > 0
  };
}
