import { protectedProcedure, createTRPCRouter } from "../init";
import { uuid } from "@/lib/uuid";
import { z } from "zod";
import { node } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc } from "drizzle-orm";

export const nodeRouter = createTRPCRouter({
    // Get all available nodes (system nodes + user's custom nodes)
    getAvailableNodes: protectedProcedure
        .input(z.object({
            specialty: z.string().optional(), // Filter by specialty
            includeInactive: z.boolean().default(false), // Include inactive nodes
            includeUserNodes: z.boolean().default(true), // Include user-created nodes
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { 
                specialty, 
                includeInactive = false, 
                includeUserNodes = true, 
                limit = 50, 
                offset = 0 
            } = input || {};

            try {
                // Build where conditions
                const whereConditions = [];
                
                // Filter by specialty if provided
                if (specialty) {
                    whereConditions.push(eq(node.specialty, specialty as any));
                }
                
                // Filter by active status
                if (!includeInactive) {
                    whereConditions.push(eq(node.isActive, true));
                }

                // Include system nodes and optionally user nodes
                if (includeUserNodes) {
                    // System nodes OR nodes created by current user
                    whereConditions.push(
                        // This will be handled in the query itself as an OR condition
                    );
                } else {
                    // Only system nodes
                    whereConditions.push(eq(node.isSystemNode, true));
                }

                // Fetch nodes with pagination
                const nodes = await ctx.db.query.node.findMany({
                    where: includeUserNodes 
                        ? and(...whereConditions) 
                        : and(...whereConditions),
                    orderBy: [
                        // System nodes first
                        desc(node.isSystemNode),
                        // Then by specialty
                        asc(node.specialty),
                        // Then by name
                        asc(node.name)
                    ],
                    limit,
                    offset,
                });

                // Filter user nodes in application logic since Drizzle OR conditions can be complex
                const filteredNodes = includeUserNodes 
                    ? nodes.filter(n => n.isSystemNode || n.createdByUserId === user.id)
                    : nodes;

                return {
                    success: true,
                    nodes: filteredNodes.map(nodeItem => ({
                        id: nodeItem.id,
                        name: nodeItem.name,
                        description: nodeItem.description,
                        specialty: nodeItem.specialty,
                        isSystemNode: nodeItem.isSystemNode,
                        isActive: nodeItem.isActive,
                        createdByUserId: nodeItem.createdByUserId,
                        createdAt: nodeItem.createdAt,
                        updatedAt: nodeItem.updatedAt,
                    })),
                    pagination: {
                        limit,
                        offset,
                        hasMore: filteredNodes.length === limit,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch nodes"
                });
            }
        }),

    // Get nodes by specific specialties
    getNodesBySpecialty: protectedProcedure
        .input(z.object({
            specialties: z.array(z.string()).min(1).max(10),
            includeInactive: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { specialties, includeInactive = false } = input;

            try {
                const nodes = await ctx.db.query.node.findMany({
                    where: and(
                        includeInactive ? undefined : eq(node.isActive, true)
                    ),
                    orderBy: [
                        desc(node.isSystemNode),
                        asc(node.specialty),
                        asc(node.name)
                    ],
                });

                // Filter by specialties and user access
                const filteredNodes = nodes.filter(n => 
                    specialties.includes(n.specialty) && 
                    (n.isSystemNode || n.createdByUserId === user.id)
                );

                // Group by specialty
                const nodesBySpecialty = specialties.reduce((acc, specialty) => {
                    acc[specialty] = filteredNodes.filter(n => n.specialty === specialty);
                    return acc;
                }, {} as Record<string, typeof filteredNodes>);

                return {
                    success: true,
                    nodesBySpecialty,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch nodes by specialty"
                });
            }
        }),

    // Get a specific node with full details (including prompt)
    getNode: protectedProcedure
        .input(z.object({
            nodeId: z.string().min(1, { message: "Node ID is required" }),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { nodeId } = input;

            try {
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

                return {
                    success: true,
                    node: {
                        id: nodeItem.id,
                        name: nodeItem.name,
                        description: nodeItem.description,
                        specialty: nodeItem.specialty,
                        prompt: nodeItem.prompt, // Include full prompt for authorized access
                        isSystemNode: nodeItem.isSystemNode,
                        isActive: nodeItem.isActive,
                        createdByUserId: nodeItem.createdByUserId,
                        createdAt: nodeItem.createdAt,
                        updatedAt: nodeItem.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch node"
                });
            }
        }),

    // Create a new custom node (user-created)
    createNode: protectedProcedure
        .input(z.object({
            name: z.string().min(1, { message: "Node name is required" }).max(100, { message: "Node name is too long" }),
            description: z.string().min(1, { message: "Description is required" }).max(500, { message: "Description is too long" }),
            specialty: z.string().min(1, { message: "Specialty is required" }),
            prompt: z.string().min(10, { message: "Prompt must be at least 10 characters" }).max(5000, { message: "Prompt is too long" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { name, description, specialty, prompt } = input;

            try {
                // Create the new node
                const [newNode] = await ctx.db.insert(node).values({
                    id: uuid(),
                    name,
                    description,
                    specialty: specialty as any,
                    prompt,
                    isSystemNode: false, // User-created nodes are not system nodes
                    isActive: true,
                    createdByUserId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning();

                return {
                    success: true,
                    message: "Node created successfully",
                    node: {
                        id: newNode.id,
                        name: newNode.name,
                        description: newNode.description,
                        specialty: newNode.specialty,
                        isSystemNode: newNode.isSystemNode,
                        isActive: newNode.isActive,
                        createdByUserId: newNode.createdByUserId,
                        createdAt: newNode.createdAt,
                        updatedAt: newNode.updatedAt,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create node"
                });
            }
        }),

    // Update an existing node (only user-created nodes)
    updateNode: protectedProcedure
        .input(z.object({
            nodeId: z.string().min(1, { message: "Node ID is required" }),
            name: z.string().min(1).max(100).optional(),
            description: z.string().min(1).max(500).optional(),
            specialty: z.string().optional(),
            prompt: z.string().min(10).max(5000).optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { nodeId, ...updateData } = input;

            try {
                // First, verify the node exists and belongs to the user
                const existingNode = await ctx.db.query.node.findFirst({
                    where: eq(node.id, nodeId),
                });

                if (!existingNode) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Node not found"
                    });
                }

                // Only allow updates to user-created nodes
                if (existingNode.isSystemNode) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Cannot update system nodes"
                    });
                }

                if (existingNode.createdByUserId !== user.id) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Access denied to this node"
                    });
                }

                // Update the node
                const [updatedNode] = await ctx.db.update(node).set({
                    ...updateData,
                    specialty: updateData.specialty as any,
                    updatedAt: new Date(),
                }).where(eq(node.id, nodeId)).returning();

                return {
                    success: true,
                    message: "Node updated successfully",
                    node: {
                        id: updatedNode.id,
                        name: updatedNode.name,
                        description: updatedNode.description,
                        specialty: updatedNode.specialty,
                        isSystemNode: updatedNode.isSystemNode,
                        isActive: updatedNode.isActive,
                        createdByUserId: updatedNode.createdByUserId,
                        createdAt: updatedNode.createdAt,
                        updatedAt: updatedNode.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update node"
                });
            }
        }),

    // Delete a node (only user-created nodes)
    deleteNode: protectedProcedure
        .input(z.object({
            nodeId: z.string().min(1, { message: "Node ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { nodeId } = input;

            try {
                // First, verify the node exists and belongs to the user
                const existingNode = await ctx.db.query.node.findFirst({
                    where: eq(node.id, nodeId),
                });

                if (!existingNode) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Node not found"
                    });
                }

                // Only allow deletion of user-created nodes
                if (existingNode.isSystemNode) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Cannot delete system nodes"
                    });
                }

                if (existingNode.createdByUserId !== user.id) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Access denied to this node"
                    });
                }

                // Delete the node (this will cascade to chatNode references)
                await ctx.db.delete(node).where(eq(node.id, nodeId));

                return {
                    success: true,
                    message: "Node deleted successfully"
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete node"
                });
            }
        }),
});
