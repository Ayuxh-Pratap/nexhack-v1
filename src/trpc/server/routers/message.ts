import { protectedProcedure, createTRPCRouter } from "../init";
import { uuid } from "@/lib/uuid";
import { z } from "zod";
import { message, chat } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc } from "drizzle-orm";

export const messageRouter = createTRPCRouter({
    createMessage: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            content: z.string().min(1, { message: "Message content is required" }).max(10000, { message: "Message is too long" }),
            messageType: z.enum(["user", "assistant"]),
            replyToId: z.string().optional(), // Optional reply to another message
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, content, messageType, replyToId } = input;

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

                // Create the message
                const [newMessage] = await ctx.db.insert(message).values({
                    id: uuid(),
                    chatId,
                    senderId: user.id,
                    content,
                    messageType,
                    status: "sent",
                    replyToId: replyToId || null,
                    isEdited: false,
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning();

                // Update the chat's last message information
                await ctx.db.update(chat).set({
                    lastMessageId: newMessage.id,
                    lastMessageAt: newMessage.createdAt,
                    updatedAt: new Date(),
                }).where(eq(chat.id, chatId));

                return {
                    success: true,
                    message: "Message created successfully",
                    messageData: {
                        id: newMessage.id,
                        chatId: newMessage.chatId,
                        senderId: newMessage.senderId,
                        content: newMessage.content,
                        messageType: newMessage.messageType,
                        status: newMessage.status,
                        replyToId: newMessage.replyToId,
                        isEdited: newMessage.isEdited,
                        isDeleted: newMessage.isDeleted,
                        createdAt: newMessage.createdAt,
                        updatedAt: newMessage.updatedAt,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create message"
                });
            }
        }),

    getMessages: protectedProcedure
        .input(z.object({
            chatId: z.string().min(1, { message: "Chat ID is required" }),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
            includeDeleted: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const { user } = ctx;
            const { chatId, limit = 50, offset = 0, includeDeleted = false } = input;

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

                // Build where conditions
                const whereConditions = [eq(message.chatId, chatId)];
                
                if (!includeDeleted) {
                    whereConditions.push(eq(message.isDeleted, false));
                }

                // Fetch messages with pagination (newest first)
                const messages = await ctx.db.query.message.findMany({
                    where: and(...whereConditions),
                    orderBy: [desc(message.createdAt)],
                    limit,
                    offset,
                });

                // Get total count for pagination
                const totalCount = await ctx.db.query.message.findMany({
                    where: and(...whereConditions),
                });

                return {
                    success: true,
                    messages: messages.map(msg => ({
                        id: msg.id,
                        chatId: msg.chatId,
                        senderId: msg.senderId,
                        content: msg.content,
                        messageType: msg.messageType,
                        status: msg.status,
                        replyToId: msg.replyToId,
                        isEdited: msg.isEdited,
                        isDeleted: msg.isDeleted,
                        editedAt: msg.editedAt,
                        deletedAt: msg.deletedAt,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                    })),
                    pagination: {
                        total: totalCount.length,
                        limit,
                        offset,
                        hasMore: totalCount.length > offset + limit,
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch messages"
                });
            }
        }),
});
