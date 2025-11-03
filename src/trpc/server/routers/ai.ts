import { protectedProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { aiManager } from "@/lib/ai/manager";
import { prepareVeloraPrompt } from "@/utils/velora-prompt-loader";
import { mergeNodePrompts, createContextualPrompt } from "@/utils/node-prompt-merger";
import { chatNode, node, chat } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const aiRouter = createTRPCRouter({
    generateResponse: protectedProcedure
        .input(z.object({
            messages: z.array(z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string()
            })),
            config: z.object({
                provider: z.enum(['gemini', 'openai', 'claude']).optional(),
                model: z.string().optional(),
                temperature: z.number().min(0).max(2).optional(),
                maxTokens: z.number().positive().optional(),
                systemPrompt: z.string().optional(),
                useVeloraMode: z.boolean().optional(),
                chatId: z.string().optional(), // Add chatId to enable node-based prompting
                useNodeBasedPrompting: z.boolean().default(true), // Enable/disable node prompting
            }).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { messages, config } = input;

            try {
                // Format messages for AI
                const aiMessages = aiManager.formatMessagesForAI(messages);

                // Prepare system prompt with priority order:
                // 1. Explicit systemPrompt in config (highest priority)
                // 2. Velora mode prompt (if enabled)
                // 3. Node-based prompt (if chat has active nodes)
                // 4. Default AI manager prompt (fallback)
                
                let finalConfig = { ...config };
                let systemPromptSource = 'default';
                let activeNodes: any[] = [];

                // Priority 1: Explicit system prompt overrides everything
                if (config?.systemPrompt) {
                    systemPromptSource = 'explicit';
                } 
                // Priority 2: Velora mode
                else if (config?.useVeloraMode) {
                    const veloraPrompt = prepareVeloraPrompt();
                    finalConfig.systemPrompt = veloraPrompt;
                    systemPromptSource = 'velora';
                }
                // Priority 3: Node-based prompting (if enabled and chatId provided)
                else if (config?.useNodeBasedPrompting !== false && config?.chatId) {
                    try {
                        // Verify chat belongs to user
                        const chatItem = await ctx.db.query.chat.findFirst({
                            where: and(
                                eq(chat.id, config.chatId),
                                eq(chat.userId, user.id)
                            ),
                        });

                        if (chatItem) {
                            // Get active nodes for this chat with their details
                            const chatNodes = await ctx.db
                                .select({
                                    nodeId: chatNode.nodeId,
                                    priority: chatNode.priority,
                                    nodeName: node.name,
                                    nodeSpecialty: node.specialty,
                                    nodePrompt: node.prompt,
                                })
                                .from(chatNode)
                                .innerJoin(node, eq(chatNode.nodeId, node.id))
                                .where(and(
                                    eq(chatNode.chatId, config.chatId),
                                    eq(chatNode.isActive, true),
                                    eq(node.isActive, true)
                                ))
                                .orderBy(chatNode.priority);

                            if (chatNodes.length > 0) {
                                // Transform to the format expected by prompt merger
                                const nodePromptData = chatNodes.map(cn => ({
                                    id: cn.nodeId,
                                    name: cn.nodeName,
                                    specialty: cn.nodeSpecialty,
                                    prompt: cn.nodePrompt,
                                    priority: cn.priority || 1,
                                }));

                                // Get user's last message for contextual prompting
                                const lastUserMessage = messages
                                    .filter(m => m.role === 'user')
                                    .pop()?.content || '';

                                // Create contextual prompt if we have a user query
                                const promptResult = lastUserMessage 
                                    ? createContextualPrompt(nodePromptData, lastUserMessage)
                                    : mergeNodePrompts(nodePromptData);

                                finalConfig.systemPrompt = promptResult.systemPrompt;
                                systemPromptSource = 'nodes';
                                activeNodes = nodePromptData;

                                // Adjust maxTokens based on prompt complexity if not explicitly set
                                if (!config?.maxTokens) {
                                    const { recommendedMaxTokens } = await import('@/utils/node-prompt-merger').then(m => m.getPromptSummary(promptResult));
                                    finalConfig.maxTokens = recommendedMaxTokens;
                                }
                            }
                        }
                    } catch (nodeError) {
                        // Log node processing error but continue with fallback
                        console.warn('Node-based prompting failed, falling back to default:', nodeError);
                        systemPromptSource = 'default_fallback';
                    }
                }

                // Generate AI response
                const response = await aiManager.generateResponse(aiMessages, finalConfig);

                if (!response.success) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: response.error || "Failed to generate AI response"
                    });
                }

                return {
                    success: true,
                    content: response.content,
                    provider: config?.provider || 'gemini',
                    metadata: {
                        systemPromptSource,
                        activeNodes: activeNodes.length > 0 ? activeNodes.map(n => ({
                            id: n.id,
                            name: n.name,
                            specialty: n.specialty,
                            priority: n.priority,
                        })) : undefined,
                        totalActiveNodes: activeNodes.length,
                    }
                };

            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate AI response"
                });
            }
        }),

    getAvailableProviders: protectedProcedure
        .query(async () => {
            try {
                const providers = aiManager.getAvailableProviders();
                return {
                    success: true,
                    providers
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get available providers"
                });
            }
        }),

    updateAIConfig: protectedProcedure
        .input(z.object({
            provider: z.enum(['gemini', 'openai', 'claude']).optional(),
            model: z.string().optional(),
            temperature: z.number().min(0).max(2).optional(),
            maxTokens: z.number().positive().optional(),
            systemPrompt: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;

            try {
                aiManager.updateDefaultConfig(input);
                
                return {
                    success: true,
                    message: "AI configuration updated successfully"
                };

            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update AI configuration"
                });
            }
        })
});
