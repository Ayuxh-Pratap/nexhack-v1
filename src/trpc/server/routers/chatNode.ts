import { protectedProcedure, createTRPCRouter } from "../init";
import { uuid } from "@/lib/uuid";
import { z } from "zod";
import { chatNode, node, chat } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc } from "drizzle-orm";

export const chatNodeRouter = createTRPCRouter({
    // Get active nodes for a specific chat
    getActiveChatNodes: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            includeInactive: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, includeInactive = false } = input;

            try {
                // First verify the chat belongs to the user
                const chatItem = await ctx.db.query.chat.findFirst({
                    where: and(
                        eq(chat.id, chatId),
                        eq(chat.userId, user.id)
                    ),
                });

                if (!chatItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found"
                    });
                }

                // Get active chat nodes with their node details
                const activeNodes = await ctx.db
                    .select({
                        // ChatNode fields
                        chatNodeId: chatNode.id,
                        chatId: chatNode.chatId,
                        nodeId: chatNode.nodeId,
                        addedAt: chatNode.addedAt,
                        addedByUserId: chatNode.addedByUserId,
                        isActive: chatNode.isActive,
                        priority: chatNode.priority,
                        chatNodeCreatedAt: chatNode.createdAt,
                        chatNodeUpdatedAt: chatNode.updatedAt,
                        // Node fields
                        nodeName: node.name,
                        nodeDescription: node.description,
                        nodeSpecialty: node.specialty,
                        nodePrompt: node.prompt,
                        nodeIsSystemNode: node.isSystemNode,
                        nodeIsActive: node.isActive,
                        nodeCreatedByUserId: node.createdByUserId,
                        nodeCreatedAt: node.createdAt,
                        nodeUpdatedAt: node.updatedAt,
                    })
                    .from(chatNode)
                    .innerJoin(node, eq(chatNode.nodeId, node.id))
                    .where(and(
                        eq(chatNode.chatId, chatId),
                        includeInactive ? undefined : eq(chatNode.isActive, true),
                        eq(node.isActive, true) // Always filter out inactive nodes
                    ))
                    // The issue is that .orderBy() expects a list of arguments, not an array.
                    .orderBy(
                        asc(chatNode.priority), // Priority order (1 = highest priority)
                        desc(chatNode.addedAt) // Most recently added first for same priority
                    );

                return {
                    success: true,
                    activeNodes: activeNodes.map(item => ({
                        chatNodeId: item.chatNodeId,
                        addedAt: item.addedAt,
                        addedByUserId: item.addedByUserId,
                        isActive: item.isActive,
                        priority: item.priority,
                        node: {
                            id: item.nodeId,
                            name: item.nodeName,
                            description: item.nodeDescription,
                            specialty: item.nodeSpecialty,
                            prompt: item.nodePrompt,
                            isSystemNode: item.nodeIsSystemNode,
                            isActive: item.nodeIsActive,
                            createdByUserId: item.nodeCreatedByUserId,
                            createdAt: item.nodeCreatedAt,
                            updatedAt: item.nodeUpdatedAt,
                        }
                    })),
                    totalActiveNodes: activeNodes.length,
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch active chat nodes"
                });
            }
        }),

    // Add a node to a chat session
    addNodeToChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            nodeId: z.string().min(1, { message: "Node ID is required" }),
            priority: z.number().min(1).max(10).default(1), // Priority for prompt merging
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, nodeId, priority = 1 } = input;

            try {
                // Verify the chat belongs to the user
                const chatItem = await ctx.db.query.chat.findFirst({
                    where: and(
                        eq(chat.id, chatId),
                        eq(chat.userId, user.id)
                    ),
                });

                if (!chatItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found"
                    });
                }

                // Verify the node exists and user has access to it
                const nodeItem = await ctx.db.query.node.findFirst({
                    where: eq(node.id, nodeId),
                });

                if (!nodeItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Node not found"
                    });
                }

                // Check if user has access to this node
                if (!nodeItem.isSystemNode && nodeItem.createdByUserId !== user.id) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Access denied to this node"
                    });
                }

                if (!nodeItem.isActive) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Cannot add inactive node to chat"
                    });
                }

                // Check if node is already added to this chat
                const existingChatNode = await ctx.db.query.chatNode.findFirst({
                    where: and(
                        eq(chatNode.chatId, chatId),
                        eq(chatNode.nodeId, nodeId)
                    ),
                });

                if (existingChatNode) {
                    // If exists but inactive, reactivate it
                    if (!existingChatNode.isActive) {
                        const [updatedChatNode] = await ctx.db.update(chatNode).set({
                            isActive: true,
                            priority,
                            updatedAt: new Date(),
                        }).where(eq(chatNode.id, existingChatNode.id)).returning();

                        return {
                            success: true,
                            message: "Node reactivated in chat",
                            chatNode: {
                                id: updatedChatNode.id,
                                chatId: updatedChatNode.chatId,
                                nodeId: updatedChatNode.nodeId,
                                addedAt: updatedChatNode.addedAt,
                                addedByUserId: updatedChatNode.addedByUserId,
                                isActive: updatedChatNode.isActive,
                                priority: updatedChatNode.priority,
                                createdAt: updatedChatNode.createdAt,
                                updatedAt: updatedChatNode.updatedAt,
                            }
                        };
                    } else {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Node is already active in this chat"
                        });
                    }
                }

                // Add the node to the chat
                const [newChatNode] = await ctx.db.insert(chatNode).values({
                    id: uuid(),
                    chatId,
                    nodeId,
                    addedAt: new Date(),
                    addedByUserId: user.id,
                    isActive: true,
                    priority,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning();

                return {
                    success: true,
                    message: "Node added to chat successfully",
                    chatNode: {
                        id: newChatNode.id,
                        chatId: newChatNode.chatId,
                        nodeId: newChatNode.nodeId,
                        addedAt: newChatNode.addedAt,
                        addedByUserId: newChatNode.addedByUserId,
                        isActive: newChatNode.isActive,
                        priority: newChatNode.priority,
                        createdAt: newChatNode.createdAt,
                        updatedAt: newChatNode.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to add node to chat"
                });
            }
        }),

    // Remove a node from a chat session (soft delete)
    removeNodeFromChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            nodeId: z.string().min(1, { message: "Node ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, nodeId } = input;

            try {
                // Verify the chat belongs to the user
                const chatItem = await ctx.db.query.chat.findFirst({
                    where: and(
                        eq(chat.id, chatId),
                        eq(chat.userId, user.id)
                    ),
                });

                if (!chatItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found"
                    });
                }

                // Find the chat node relationship
                const existingChatNode = await ctx.db.query.chatNode.findFirst({
                    where: and(
                        eq(chatNode.chatId, chatId),
                        eq(chatNode.nodeId, nodeId),
                        eq(chatNode.isActive, true)
                    ),
                });

                if (!existingChatNode) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Node not found in this chat"
                    });
                }

                // Soft delete by setting isActive to false
                const [updatedChatNode] = await ctx.db.update(chatNode).set({
                    isActive: false,
                    updatedAt: new Date(),
                }).where(eq(chatNode.id, existingChatNode.id)).returning();

                return {
                    success: true,
                    message: "Node removed from chat successfully",
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to remove node from chat"
                });
            }
        }),

    // Update node priority in a chat
    updateNodePriority: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            nodeId: z.string().min(1, { message: "Node ID is required" }),
            priority: z.number().min(1).max(10),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, nodeId, priority } = input;

            try {
                // Verify the chat belongs to the user
                const chatItem = await ctx.db.query.chat.findFirst({
                    where: and(
                        eq(chat.id, chatId),
                        eq(chat.userId, user.id)
                    ),
                });

                if (!chatItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found"
                    });
                }

                // Find the chat node relationship
                const existingChatNode = await ctx.db.query.chatNode.findFirst({
                    where: and(
                        eq(chatNode.chatId, chatId),
                        eq(chatNode.nodeId, nodeId),
                        eq(chatNode.isActive, true)
                    ),
                });

                if (!existingChatNode) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Active node not found in this chat"
                    });
                }

                // Update priority
                const [updatedChatNode] = await ctx.db.update(chatNode).set({
                    priority,
                    updatedAt: new Date(),
                }).where(eq(chatNode.id, existingChatNode.id)).returning();

                return {
                    success: true,
                    message: "Node priority updated successfully",
                    chatNode: {
                        id: updatedChatNode.id,
                        chatId: updatedChatNode.chatId,
                        nodeId: updatedChatNode.nodeId,
                        addedAt: updatedChatNode.addedAt,
                        addedByUserId: updatedChatNode.addedByUserId,
                        isActive: updatedChatNode.isActive,
                        priority: updatedChatNode.priority,
                        createdAt: updatedChatNode.createdAt,
                        updatedAt: updatedChatNode.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update node priority"
                });
            }
        }),

    // Bulk add multiple nodes to a chat
    addMultipleNodesToChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            nodes: z.array(z.object({
                nodeId: z.string().min(1),
                priority: z.number().min(1).max(10).default(1),
            })).min(1).max(5), // Limit to 5 nodes at once
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, nodes } = input;

            try {
                // Verify the chat belongs to the user
                const chatItem = await ctx.db.query.chat.findFirst({
                    where: and(
                        eq(chat.id, chatId),
                        eq(chat.userId, user.id)
                    ),
                });

                if (!chatItem) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found"
                    });
                }

                const results = [];
                const errors = [];

                // Process each node
                for (const { nodeId, priority } of nodes) {
                    try {
                        // Verify the node exists and user has access
                        const nodeItem = await ctx.db.query.node.findFirst({
                            where: eq(node.id, nodeId),
                        });

                        if (!nodeItem) {
                            errors.push({ nodeId, error: "Node not found" });
                            continue;
                        }

                        if (!nodeItem.isSystemNode && nodeItem.createdByUserId !== user.id) {
                            errors.push({ nodeId, error: "Access denied to this node" });
                            continue;
                        }

                        if (!nodeItem.isActive) {
                            errors.push({ nodeId, error: "Cannot add inactive node" });
                            continue;
                        }

                        // Check if already exists
                        const existingChatNode = await ctx.db.query.chatNode.findFirst({
                            where: and(
                                eq(chatNode.chatId, chatId),
                                eq(chatNode.nodeId, nodeId)
                            ),
                        });

                        if (existingChatNode && existingChatNode.isActive) {
                            errors.push({ nodeId, error: "Node already active in chat" });
                            continue;
                        }

                        if (existingChatNode && !existingChatNode.isActive) {
                            // Reactivate existing node
                            const [updatedChatNode] = await ctx.db.update(chatNode).set({
                                isActive: true,
                                priority,
                                updatedAt: new Date(),
                            }).where(eq(chatNode.id, existingChatNode.id)).returning();

                            results.push({
                                nodeId,
                                action: "reactivated",
                                chatNodeId: updatedChatNode.id,
                            });
                        } else {
                            // Add new node
                            const [newChatNode] = await ctx.db.insert(chatNode).values({
                                id: uuid(),
                                chatId,
                                nodeId,
                                addedAt: new Date(),
                                addedByUserId: user.id,
                                isActive: true,
                                priority,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }).returning();

                            results.push({
                                nodeId,
                                action: "added",
                                chatNodeId: newChatNode.id,
                            });
                        }
                    } catch (error) {
                        errors.push({ nodeId, error: "Processing failed" });
                    }
                }

                return {
                    success: true,
                    message: `Processed ${nodes.length} nodes`,
                    results,
                    errors,
                    summary: {
                        total: nodes.length,
                        successful: results.length,
                        failed: errors.length,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to add multiple nodes to chat"
                });
            }
        }),
});
