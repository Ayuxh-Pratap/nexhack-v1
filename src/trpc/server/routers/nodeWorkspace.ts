import { protectedProcedure, createTRPCRouter } from "../init";
import { uuid } from "@/lib/uuid";
import { z } from "zod";
import { workspaceConfiguration, chatNode, node, chat } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc } from "drizzle-orm";

// React Flow Node and Edge types for validation
const ReactFlowNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
    data: z.object({
        label: z.string(),
        specialty: z.string(),
        description: z.string(),
        priority: z.number().min(1).max(10),
        color: z.string().optional(),
    }),
});

const ReactFlowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
    animated: z.boolean().optional(),
    style: z.record(z.any()).optional(),
    label: z.string().optional(),
});

export const nodeWorkspaceRouter = createTRPCRouter({
    // Save a workspace configuration
    saveWorkspaceConfiguration: protectedProcedure
        .input(z.object({
            name: z.string().min(1, { message: "Configuration name is required" }).max(100),
            description: z.string().max(500).optional(),
            nodes: z.array(ReactFlowNodeSchema).min(1, { message: "At least one node is required" }),
            edges: z.array(ReactFlowEdgeSchema).default([]),
            tags: z.array(z.string()).optional(),
            isActive: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { name, description, nodes, edges, tags, isActive } = input;

            try {
                // If setting as active, deactivate all other configurations for this user
                if (isActive) {
                    await ctx.db.update(workspaceConfiguration)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(eq(workspaceConfiguration.userId, user.id));
                }

                // Create the new workspace configuration
                const [newConfig] = await ctx.db.insert(workspaceConfiguration).values({
                    id: uuid(),
                    name,
                    description,
                    userId: user.id,
                    nodes: JSON.stringify(nodes),
                    edges: JSON.stringify(edges),
                    isActive,
                    isTemplate: false,
                    tags: tags ? JSON.stringify(tags) : null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning();

                return {
                    success: true,
                    message: "Workspace configuration saved successfully",
                    configuration: {
                        id: newConfig.id,
                        name: newConfig.name,
                        description: newConfig.description,
                        isActive: newConfig.isActive,
                        isTemplate: newConfig.isTemplate,
                        tags: newConfig.tags ? JSON.parse(newConfig.tags) : [],
                        nodeCount: nodes.length,
                        edgeCount: edges.length,
                        createdAt: newConfig.createdAt,
                        updatedAt: newConfig.updatedAt,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to save workspace configuration"
                });
            }
        }),

    // Get all workspace configurations for a user
    getWorkspaceConfigurations: protectedProcedure
        .input(z.object({
            includeTemplates: z.boolean().default(false),
            includeInactive: z.boolean().default(true),
            limit: z.number().min(1).max(50).default(20),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { 
                includeTemplates = false, 
                includeInactive = true, 
                limit = 20, 
                offset = 0 
            } = input || {};

            try {
                const whereConditions = [eq(workspaceConfiguration.userId, user.id)];
                
                if (!includeTemplates) {
                    whereConditions.push(eq(workspaceConfiguration.isTemplate, false));
                }
                
                if (!includeInactive) {
                    whereConditions.push(eq(workspaceConfiguration.isActive, true));
                }

                const configurations = await ctx.db.query.workspaceConfiguration.findMany({
                    where: and(...whereConditions),
                    orderBy: [
                        desc(workspaceConfiguration.isActive),
                        desc(workspaceConfiguration.updatedAt),
                        asc(workspaceConfiguration.name)
                    ],
                    limit,
                    offset,
                });

                return {
                    success: true,
                    configurations: configurations.map(config => ({
                        id: config.id,
                        name: config.name,
                        description: config.description,
                        isActive: config.isActive,
                        isTemplate: config.isTemplate,
                        tags: config.tags ? JSON.parse(config.tags) : [],
                        nodeCount: JSON.parse(config.nodes).length,
                        edgeCount: JSON.parse(config.edges).length,
                        createdAt: config.createdAt,
                        updatedAt: config.updatedAt,
                    })),
                    pagination: {
                        limit,
                        offset,
                        hasMore: configurations.length === limit,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch workspace configurations"
                });
            }
        }),

    // Load a specific workspace configuration
    loadWorkspaceConfiguration: protectedProcedure
        .input(z.object({
            configurationId: z.string().min(1, { message: "Configuration ID is required" }),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { configurationId } = input;

            try {
                const config = await ctx.db.query.workspaceConfiguration.findFirst({
                    where: and(
                        eq(workspaceConfiguration.id, configurationId),
                        eq(workspaceConfiguration.userId, user.id)
                    ),
                });

                if (!config) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workspace configuration not found"
                    });
                }

                return {
                    success: true,
                    configuration: {
                        id: config.id,
                        name: config.name,
                        description: config.description,
                        isActive: config.isActive,
                        isTemplate: config.isTemplate,
                        tags: config.tags ? JSON.parse(config.tags) : [],
                        nodes: JSON.parse(config.nodes),
                        edges: JSON.parse(config.edges),
                        createdAt: config.createdAt,
                        updatedAt: config.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to load workspace configuration"
                });
            }
        }),

    // Update an existing workspace configuration
    updateWorkspaceConfiguration: protectedProcedure
        .input(z.object({
            configurationId: z.string().min(1, { message: "Configuration ID is required" }),
            name: z.string().min(1).max(100).optional(),
            description: z.string().max(500).optional(),
            nodes: z.array(ReactFlowNodeSchema).optional(),
            edges: z.array(ReactFlowEdgeSchema).optional(),
            tags: z.array(z.string()).optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { configurationId, ...updateData } = input;

            try {
                // Verify the configuration exists and belongs to the user
                const existingConfig = await ctx.db.query.workspaceConfiguration.findFirst({
                    where: and(
                        eq(workspaceConfiguration.id, configurationId),
                        eq(workspaceConfiguration.userId, user.id)
                    ),
                });

                if (!existingConfig) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workspace configuration not found"
                    });
                }

                // If setting as active, deactivate all other configurations
                if (updateData.isActive) {
                    await ctx.db.update(workspaceConfiguration)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(eq(workspaceConfiguration.userId, user.id));
                }

                // Prepare update data
                const updateValues: any = {
                    updatedAt: new Date(),
                };

                if (updateData.name !== undefined) updateValues.name = updateData.name;
                if (updateData.description !== undefined) updateValues.description = updateData.description;
                if (updateData.nodes !== undefined) updateValues.nodes = JSON.stringify(updateData.nodes);
                if (updateData.edges !== undefined) updateValues.edges = JSON.stringify(updateData.edges);
                if (updateData.tags !== undefined) updateValues.tags = JSON.stringify(updateData.tags);
                if (updateData.isActive !== undefined) updateValues.isActive = updateData.isActive;

                // Update the configuration
                const [updatedConfig] = await ctx.db.update(workspaceConfiguration)
                    .set(updateValues)
                    .where(eq(workspaceConfiguration.id, configurationId))
                    .returning();

                return {
                    success: true,
                    message: "Workspace configuration updated successfully",
                    configuration: {
                        id: updatedConfig.id,
                        name: updatedConfig.name,
                        description: updatedConfig.description,
                        isActive: updatedConfig.isActive,
                        isTemplate: updatedConfig.isTemplate,
                        tags: updatedConfig.tags ? JSON.parse(updatedConfig.tags) : [],
                        nodeCount: JSON.parse(updatedConfig.nodes).length,
                        edgeCount: JSON.parse(updatedConfig.edges).length,
                        createdAt: updatedConfig.createdAt,
                        updatedAt: updatedConfig.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update workspace configuration"
                });
            }
        }),

    // Delete a workspace configuration
    deleteWorkspaceConfiguration: protectedProcedure
        .input(z.object({
            configurationId: z.string().min(1, { message: "Configuration ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { configurationId } = input;

            try {
                // Verify the configuration exists and belongs to the user
                const existingConfig = await ctx.db.query.workspaceConfiguration.findFirst({
                    where: and(
                        eq(workspaceConfiguration.id, configurationId),
                        eq(workspaceConfiguration.userId, user.id)
                    ),
                });

                if (!existingConfig) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workspace configuration not found"
                    });
                }

                // Delete the configuration
                await ctx.db.delete(workspaceConfiguration)
                    .where(eq(workspaceConfiguration.id, configurationId));

                return {
                    success: true,
                    message: "Workspace configuration deleted successfully"
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete workspace configuration"
                });
            }
        }),

    // Activate a workspace configuration for a specific chat
    activateWorkspaceForChat: protectedProcedure
        .input(z.object({
            configurationId: z.string().min(1, { message: "Configuration ID is required" }),
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            replaceExisting: z.boolean().default(true), // Whether to replace existing active nodes
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { configurationId, chatId, replaceExisting = true } = input;

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

                // Load the workspace configuration
                const config = await ctx.db.query.workspaceConfiguration.findFirst({
                    where: and(
                        eq(workspaceConfiguration.id, configurationId),
                        eq(workspaceConfiguration.userId, user.id)
                    ),
                });

                if (!config) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Workspace configuration not found"
                    });
                }

                const nodes = JSON.parse(config.nodes);
                const edges = JSON.parse(config.edges);

                // Validate that all nodes in the configuration exist and are accessible
                const nodeIds = nodes.map((node: any) => node.data.label); // Using label as node identifier for now
                const existingNodes = await ctx.db.query.node.findMany({
                    where: and(
                        eq(node.isActive, true)
                    ),
                });

                // Filter to only include nodes that exist in the database
                const validNodes = nodes.filter((flowNode: any) => 
                    existingNodes.some(dbNode => dbNode.name === flowNode.data.label)
                );

                if (validNodes.length === 0) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "No valid nodes found in the workspace configuration"
                    });
                }

                // If replacing existing, deactivate all current chat nodes
                if (replaceExisting) {
                    await ctx.db.update(chatNode)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(and(
                            eq(chatNode.chatId, chatId),
                            eq(chatNode.isActive, true)
                        ));
                }

                // Add nodes to the chat with priorities based on their position in the configuration
                const results = [];
                for (let i = 0; i < validNodes.length; i++) {
                    const flowNode = validNodes[i];
                    const dbNode = existingNodes.find(n => n.name === flowNode.data.label);
                    
                    if (dbNode) {
                        // Check if node is already active in chat
                        const existingChatNode = await ctx.db.query.chatNode.findFirst({
                            where: and(
                                eq(chatNode.chatId, chatId),
                                eq(chatNode.nodeId, dbNode.id),
                                eq(chatNode.isActive, true)
                            ),
                        });

                        if (existingChatNode) {
                            // Update priority if already exists
                            await ctx.db.update(chatNode)
                                .set({ 
                                    priority: flowNode.data.priority || (i + 1),
                                    updatedAt: new Date() 
                                })
                                .where(eq(chatNode.id, existingChatNode.id));
                            
                            results.push({
                                nodeId: dbNode.id,
                                nodeName: dbNode.name,
                                action: "updated",
                                priority: flowNode.data.priority || (i + 1),
                            });
                        } else {
                            // Add new node to chat
                            const [newChatNode] = await ctx.db.insert(chatNode).values({
                                id: uuid(),
                                chatId,
                                nodeId: dbNode.id,
                                addedAt: new Date(),
                                addedByUserId: user.id,
                                isActive: true,
                                priority: flowNode.data.priority || (i + 1),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }).returning();

                            results.push({
                                nodeId: dbNode.id,
                                nodeName: dbNode.name,
                                action: "added",
                                priority: flowNode.data.priority || (i + 1),
                            });
                        }
                    }
                }

                return {
                    success: true,
                    message: `Workspace configuration activated for chat. ${results.length} nodes processed.`,
                    results,
                    summary: {
                        totalNodes: validNodes.length,
                        successful: results.length,
                        failed: validNodes.length - results.length,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to activate workspace for chat"
                });
            }
        }),

    // Get the currently active workspace configuration for a user
    getActiveWorkspaceConfiguration: protectedProcedure
        .query(async ({ ctx }) => {
            const { user } = ctx;

            try {
                const activeConfig = await ctx.db.query.workspaceConfiguration.findFirst({
                    where: and(
                        eq(workspaceConfiguration.userId, user.id),
                        eq(workspaceConfiguration.isActive, true)
                    ),
                    orderBy: [desc(workspaceConfiguration.updatedAt)],
                });

                if (!activeConfig) {
                    return {
                        success: true,
                        configuration: null,
                        message: "No active workspace configuration found"
                    };
                }

                return {
                    success: true,
                    configuration: {
                        id: activeConfig.id,
                        name: activeConfig.name,
                        description: activeConfig.description,
                        isActive: activeConfig.isActive,
                        isTemplate: activeConfig.isTemplate,
                        tags: activeConfig.tags ? JSON.parse(activeConfig.tags) : [],
                        nodes: JSON.parse(activeConfig.nodes),
                        edges: JSON.parse(activeConfig.edges),
                        createdAt: activeConfig.createdAt,
                        updatedAt: activeConfig.updatedAt,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get active workspace configuration"
                });
            }
        }),
});
