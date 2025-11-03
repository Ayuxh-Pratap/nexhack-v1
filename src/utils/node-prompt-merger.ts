/**
 * Node Prompt Merger Utility
 * Intelligently combines multiple specialist node prompts into cohesive system prompts
 */

interface NodePromptData {
  id: string;
  name: string;
  specialty: string;
  prompt: string;
  priority: number;
}

interface MergedPromptResult {
  systemPrompt: string;
  activeSpecialties: string[];
  totalNodes: number;
  priorityOrder: string[];
}

/**
 * Base academic/placement system prompt that provides the foundation
 */
const BASE_ACADEMIC_PROMPT = `You are an expert academic teacher and career counselor with specialized expertise in placements, higher education, and career development. You provide accurate, helpful, and professional guidance based on your training and experience.

CORE GUIDELINES:
- Be accurate, evidence-based, and professional
- Use clear, accessible language appropriate for students
- Provide comprehensive but concise responses
- Draw from your specialized academic knowledge and industry experience
- Reference when expertise comes from specific academic/career specialties
- Prioritize student success and career growth in all recommendations
- When appropriate, suggest collaboration with other specialists for comprehensive guidance
- Focus on practical, actionable advice for placements and higher studies`;

/**
 * Merges multiple node prompts into a single cohesive system prompt
 */
export function mergeNodePrompts(nodePrompts: NodePromptData[]): MergedPromptResult {
  if (nodePrompts.length === 0) {
    return {
      systemPrompt: BASE_ACADEMIC_PROMPT,
      activeSpecialties: [],
      totalNodes: 0,
      priorityOrder: [],
    };
  }

  // Sort nodes by priority (1 = highest priority)
  const sortedNodes = [...nodePrompts].sort((a, b) => a.priority - b.priority);
  
  // Create specialty list and priority order
  const activeSpecialties = sortedNodes.map(node => node.specialty);
  const priorityOrder = sortedNodes.map(node => node.name);

  // Single node - use enhanced individual approach
  if (sortedNodes.length === 1) {
    const node = sortedNodes[0];
    const systemPrompt = `${BASE_ACADEMIC_PROMPT}

SPECIALIST EXPERTISE:
You are a **${node.name}** with specialized knowledge and experience in ${node.specialty}. You have extensive training and expertise in this field.

${node.prompt}

When responding:
- Act as the specialist you are - provide expert academic/career guidance from your ${node.specialty} perspective
- Draw primarily from your specialized knowledge and teaching/industry experience
- Be confident in your expertise while remaining professional and encouraging
- Provide specific, actionable advice based on your specialty (academic concepts, placement prep, etc.)
- Suggest collaboration with other specialists only when the topic falls outside your expertise`;

    return {
      systemPrompt,
      activeSpecialties,
      totalNodes: 1,
      priorityOrder,
    };
  }

  // Multiple nodes - create comprehensive multi-specialty approach
  const specialtyBlocks = sortedNodes.map((node, index) => {
    const priorityLabel = index === 0 ? " (PRIMARY)" : "";
    return `**${index + 1}. ${node.name}${priorityLabel}** - ${node.specialty}:
${node.prompt}`;
  }).join('\n\n');

  const specialtyNames = sortedNodes.map(node => node.name).join(', ');
  const primarySpecialty = sortedNodes[0];

  const systemPrompt = `${BASE_ACADEMIC_PROMPT}

MULTI-SPECIALTY ACADEMIC EXPERTISE:
You are a comprehensive academic team combining expertise from ${sortedNodes.length} specialists: ${specialtyNames}. You have extensive training and experience across these academic and career specialties.

Your active specialties include:
${specialtyBlocks}

MULTI-SPECIALTY RESPONSE GUIDELINES:
- **Primary Focus**: Lead with your **${primarySpecialty.name}** (${primarySpecialty.specialty}) expertise as your highest priority specialty
- **Secondary Expertise**: Integrate relevant knowledge from your other active specialties when applicable
- **Specialty Attribution**: Clearly indicate which specialty area informs each part of your response (e.g., "From a ${primarySpecialty.specialty} perspective..." or "The ${sortedNodes[1]?.specialty} approach would be...")
- **Collaborative Approach**: When multiple specialties are relevant, present a comprehensive view that integrates different perspectives
- **Expert Confidence**: Act as the academic professional you are - provide specific, actionable advice based on your combined expertise
- **Scope Awareness**: Stay within the combined scope of your active specialties and refer to other specialists only when the topic falls outside your expertise

RESPONSE FORMAT:
When providing academic/career guidance:
1. Lead with your primary specialty perspective (${primarySpecialty.specialty})
2. Include relevant insights from secondary specialties when applicable
3. Clearly attribute advice to specific specialty areas
4. Provide integrated recommendations that consider all active specialties
5. Be confident in your academic expertise while remaining professional and encouraging`;

  return {
    systemPrompt,
    activeSpecialties,
    totalNodes: sortedNodes.length,
    priorityOrder,
  };
}

/**
 * Creates a context-aware prompt for specific academic/career queries
 */
export function createContextualPrompt(
  nodePrompts: NodePromptData[],
  userQuery: string
): MergedPromptResult & { contextualEnhancement: string } {
  const baseResult = mergeNodePrompts(nodePrompts);
  
  if (nodePrompts.length === 0) {
    return {
      ...baseResult,
      contextualEnhancement: "",
    };
  }

  // Analyze user query for specialty relevance (basic keyword matching)
  const queryLower = userQuery.toLowerCase();
  const specialtyRelevance = nodePrompts.map(node => {
    const specialty = node.specialty.toLowerCase();
    const name = node.name.toLowerCase();
    
    // Check if query contains specialty-related keywords
    let relevanceScore = 0;
    if (queryLower.includes(specialty) || queryLower.includes(name)) {
      relevanceScore = 3; // Direct mention
    } else if (isQueryRelevantToSpecialty(queryLower, specialty)) {
      relevanceScore = 2; // Contextually relevant
    } else {
      relevanceScore = 1; // General relevance
    }
    
    return { ...node, relevanceScore };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const mostRelevantSpecialty = specialtyRelevance[0];
  
  const contextualEnhancement = `
QUERY-SPECIFIC GUIDANCE:
Based on the user's query, **${mostRelevantSpecialty.name}** appears most relevant. While maintaining your multi-specialty approach:
- Lead with your ${mostRelevantSpecialty.specialty} expertise and provide specific academic/career guidance
- Consider how other active specialties might contribute to a comprehensive answer
- Act as the academic professional you are - provide expert advice based on your training and experience
- If the query falls outside all active specialties, clearly state this and suggest appropriate specialist consultation`;

  return {
    ...baseResult,
    systemPrompt: `${baseResult.systemPrompt}\n${contextualEnhancement}`,
    contextualEnhancement,
  };
}

/**
 * Basic specialty relevance checker for academic/career specialties
 */
function isQueryRelevantToSpecialty(query: string, specialty: string): boolean {
  const specialtyKeywords: Record<string, string[]> = {
    data_structures_algorithms: ['dsa', 'data structure', 'algorithm', 'leetcode', 'coding', 'array', 'tree', 'graph', 'dp', 'dynamic programming', 'binary search', 'sorting'],
    system_design: ['system design', 'architecture', 'scalability', 'microservices', 'database design', 'distributed', 'load balancing', 'caching'],
    interview_prep: ['interview', 'technical interview', 'coding interview', 'hr interview', 'mock interview', 'placement', 'hiring'],
    competitive_programming: ['competitive', 'codechef', 'codeforces', 'hackerrank', 'spoj', 'icpc', 'contest', 'cp'],
    web_development: ['web dev', 'frontend', 'backend', 'react', 'node', 'javascript', 'full stack', 'api', 'rest'],
    machine_learning: ['ml', 'machine learning', 'deep learning', 'neural network', 'ai', 'artificial intelligence', 'model', 'training'],
    higher_education: ['masters', 'phd', 'graduate', 'university', 'admission', 'sop', 'statement of purpose', 'lor', 'recommendation'],
    competitive_exams: ['gate', 'cat', 'gre', 'toefl', 'ielts', 'exam', 'entrance', 'preparation', 'syllabus'],
    resume_building: ['resume', 'cv', 'portfolio', 'projects', 'experience', 'skills', 'achievements'],
    soft_skills: ['communication', 'leadership', 'teamwork', 'presentation', 'negotiation', 'interpersonal'],
  };

  const keywords = specialtyKeywords[specialty] || [];
  return keywords.some(keyword => query.includes(keyword));
}

/**
 * Validates that node prompts are suitable for merging
 */
export function validateNodePrompts(nodePrompts: NodePromptData[]): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for basic validation
  nodePrompts.forEach((node, index) => {
    if (!node.prompt || node.prompt.trim().length < 10) {
      errors.push(`Node ${index + 1} (${node.name}): Prompt is too short or empty`);
    }
    
    if (!node.name || node.name.trim().length < 2) {
      errors.push(`Node ${index + 1}: Name is required`);
    }
    
    if (!node.specialty || node.specialty.trim().length < 2) {
      errors.push(`Node ${index + 1} (${node.name}): Specialty is required`);
    }
  });

  // Check for potential conflicts
  if (nodePrompts.length > 5) {
    warnings.push("Using more than 5 specialists may result in very long prompts and potential performance issues");
  }

  // Check for duplicate specialties
  const specialtyCounts = nodePrompts.reduce((acc, node) => {
    acc[node.specialty] = (acc[node.specialty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(specialtyCounts).forEach(([specialty, count]) => {
    if (count > 1) {
      warnings.push(`Multiple nodes with ${specialty} specialty detected. Consider using only one per specialty for cleaner responses.`);
    }
  });

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Gets a summary of merged prompt characteristics
 */
export function getPromptSummary(result: MergedPromptResult): {
  tokenEstimate: number;
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'very_complex';
  recommendedMaxTokens: number;
} {
  const tokenEstimate = Math.ceil(result.systemPrompt.length / 4); // Rough estimate: 1 token ≈ 4 characters
  
  let complexityLevel: 'simple' | 'moderate' | 'complex' | 'very_complex';
  let recommendedMaxTokens: number;
  
  if (result.totalNodes === 0 || result.totalNodes === 1) {
    complexityLevel = 'simple';
    recommendedMaxTokens = 2048;
  } else if (result.totalNodes === 2) {
    complexityLevel = 'moderate';
    recommendedMaxTokens = 3072;
  } else if (result.totalNodes <= 4) {
    complexityLevel = 'complex';
    recommendedMaxTokens = 4096;
  } else {
    complexityLevel = 'very_complex';
    recommendedMaxTokens = 6144;
  }

  return {
    tokenEstimate,
    complexityLevel,
    recommendedMaxTokens,
  };
}
