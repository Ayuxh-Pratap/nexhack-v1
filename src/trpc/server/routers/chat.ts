import { protectedProcedure, createTRPCRouter } from "../init";
import { uuid } from "@/lib/uuid";
import { z } from "zod";
import { chat } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
    createChat: protectedProcedure
        .input(z.object({
            title: z.string().min(1, { message: "Chat title is required" }).max(200, { message: "Chat title is too long" }).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { title } = input;

            try {
                // Generate a default title if none provided
                const chatTitle = title || `New Chat ${new Date().toLocaleDateString()}`;

                // Create new chat
                const [newChat] = await ctx.db.insert(chat).values({
            id: uuid(),
                    title: chatTitle,
                    userId: user.id,
                    isArchived: false,
                    isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

                return {
                    success: true,
                    message: "Chat created successfully",
                    chat: {
                        id: newChat.id,
                        title: newChat.title,
                        userId: newChat.userId,
                        isArchived: newChat.isArchived,
                        isPinned: newChat.isPinned,
                        lastMessageId: newChat.lastMessageId,
                        lastMessageAt: newChat.lastMessageAt,
                        createdAt: newChat.createdAt,
                        updatedAt: newChat.updatedAt,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create chat"
                });
            }
        }),

    getChats: protectedProcedure
        .input(z.object({
            includeArchived: z.boolean().default(false),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { includeArchived = false, limit = 50, offset = 0 } = input || {};

            try {
                // Build where conditions
                const whereConditions = [eq(chat.userId, user.id)];

                if (!includeArchived) {
                    whereConditions.push(eq(chat.isArchived, false));
                }

                // Fetch chats with pagination
                const chats = await ctx.db.query.chat.findMany({
                    where: and(...whereConditions),
                    orderBy: [
                        // Pinned chats first
                        desc(chat.isPinned),
                        // Then by last message time (most recent first)
                        desc(chat.lastMessageAt),
                        // Finally by creation time
                        desc(chat.createdAt)
                    ],
                    limit,
                    offset,
                });

                // Get total count for pagination
                const totalCount = await ctx.db.query.chat.findMany({
                    where: and(...whereConditions),
                });

                return {
                    success: true,
                    chats: chats.map(chatItem => ({
                        id: chatItem.id,
                        title: chatItem.title,
                        userId: chatItem.userId,
                        isArchived: chatItem.isArchived,
                        isPinned: chatItem.isPinned,
                        lastMessageId: chatItem.lastMessageId,
                        lastMessageAt: chatItem.lastMessageAt,
                        createdAt: chatItem.createdAt,
                        updatedAt: chatItem.updatedAt,
                    })),
                    pagination: {
                        total: totalCount.length,
                        limit,
                        offset,
                        hasMore: totalCount.length > offset + limit,
                    }
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch chats"
                });
            }
        }),

    getChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId } = input;

            try {
                // Fetch specific chat
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

                return {
                    success: true,
                    chat: {
                        id: chatItem.id,
                        title: chatItem.title,
                        userId: chatItem.userId,
                        isArchived: chatItem.isArchived,
                        isPinned: chatItem.isPinned,
                        lastMessageId: chatItem.lastMessageId,
                        lastMessageAt: chatItem.lastMessageAt,
                        createdAt: chatItem.createdAt,
                        updatedAt: chatItem.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch chat"
                });
            }
        }),

    pinChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId } = input;

            try {
                // First, verify that the chat exists and belongs to the user
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

                // Toggle pin status
                const [updatedChat] = await ctx.db.update(chat).set({
                    isPinned: !chatItem.isPinned,
                    updatedAt: new Date(),
                }).where(eq(chat.id, chatId)).returning();

                return {
                    success: true,
                    message: `Chat ${updatedChat.isPinned ? 'pinned' : 'unpinned'} successfully`,
                    chat: {
                        id: updatedChat.id,
                        title: updatedChat.title,
                        userId: updatedChat.userId,
                        isArchived: updatedChat.isArchived,
                        isPinned: updatedChat.isPinned,
                        lastMessageId: updatedChat.lastMessageId,
                        lastMessageAt: updatedChat.lastMessageAt,
                        createdAt: updatedChat.createdAt,
                        updatedAt: updatedChat.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to pin/unpin chat"
                });
            }
        }),

    archiveChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId } = input;

            try {
                // First, verify that the chat exists and belongs to the user
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

                // Archive the chat
                const [updatedChat] = await ctx.db.update(chat).set({
                    isArchived: true,
                    updatedAt: new Date(),
                }).where(eq(chat.id, chatId)).returning();

                return {
                    success: true,
                    message: "Chat archived successfully",
                    chat: {
                        id: updatedChat.id,
                        title: updatedChat.title,
                        userId: updatedChat.userId,
                        isArchived: updatedChat.isArchived,
                        isPinned: updatedChat.isPinned,
                        lastMessageId: updatedChat.lastMessageId,
                        lastMessageAt: updatedChat.lastMessageAt,
                        createdAt: updatedChat.createdAt,
                        updatedAt: updatedChat.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to archive chat"
                });
            }
        }),

    deleteChat: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId } = input;

            try {
                // First, verify that the chat exists and belongs to the user
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

                // Delete the chat (this will cascade to messages due to foreign key constraints)
                await ctx.db.delete(chat).where(eq(chat.id, chatId));

                return {
                    success: true,
                    message: "Chat deleted successfully"
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete chat"
                });
            }
    }),
});
