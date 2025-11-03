import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { eq, and, ne } from "drizzle-orm";
import { user } from "@/db/schema";

// User authentication and profile management router
// Handles login material and user profile operations
export const userRouter = createTRPCRouter({
    // Get current user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }),

    // Update user profile
    updateProfile: protectedProcedure.input(z.object({
        name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name is too long" }),
        email: z.string().email({ message: "Invalid email address" }),
    })).mutation(async ({ ctx, input }) => {
        const { user: currentUser } = ctx;
        const { name, email } = input;

        try {
            // Check if email is already taken by another user
            if (email !== currentUser.email) {
                const existingUser = await ctx.db.query.user.findFirst({
                    where: and(eq(user.email, email), ne(user.id, currentUser.id))
                });

                if (existingUser) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Email is already taken by another user"
                    });
                }
            }

            // Update user in database
            await ctx.db.update(user).set({
                name,
                email,
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));

            return {
                success: true,
                message: "Profile updated successfully",
                user: {
                    id: currentUser.id,
                    name,
                    email,
                    emailVerified: email === currentUser.email ? currentUser.emailVerified : false, // Reset verification if email changed
                    image: currentUser.image,
                    createdAt: currentUser.createdAt,
                    updatedAt: new Date(),
                }
            };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update profile"
            });
        }
    }),

    // Logout user
    logout: protectedProcedure.mutation(async () => {
        // In a real implementation, you might want to invalidate sessions
        // For now, we'll just return success
        return {
            success: true,
            message: "Logged out successfully"
        };
    }),
});
