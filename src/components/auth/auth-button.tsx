"use client";

import { ShimmerProfileMenu, ShimmerButton } from "@/components/ui/shimmer";
import { ProfileMenu } from "./profile-menu";
import { LoginMenu } from "./login-menu";
import { useSession } from "@/hooks/use-session";

interface AuthButtonProps {
    variant?: "default" | "mobile";
}

export const AuthButton = ({ variant = "default" }: AuthButtonProps) => {
    const { user, isLoading, error } = useSession();

    if (isLoading) {
        if (variant === "mobile") {
            return <ShimmerButton />;
        }
        return <ShimmerProfileMenu />;
    }

    if (user && !error) {
        return <ProfileMenu />;
    }

    if (!isLoading && !user) {
        return <LoginMenu variant={variant} />;
    }

    if (variant === "mobile") {
        return <ShimmerButton />;
    }
    return <ShimmerProfileMenu />;
};