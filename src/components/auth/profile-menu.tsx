"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { User as UserType, ProfileMenuProps } from "@/types/user";


// Component for the personalized greeting
const UserGreeting = ({ user }: { user: UserType }) => {
    const getFirstName = (name: string) => {
        const words = name.split(' ');
        return words.slice(0, 2).join(' ');
    };

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "Good morning";
        } else if (hour >= 12 && hour < 17) {
            return "Good afternoon";
        } else if (hour >= 17 && hour < 22) {
            return "Good evening";
        } else {
            return "Hello";
        }
    };

    return (
        <div className="hidden lg:flex items-center mr-4">
            <div className="flex flex-col items-end">
                <span className="text-xs text-neutral-400 font-medium tracking-wide">
                    {getTimeBasedGreeting()},
                </span>
                <span className="text-sm text-neutral-100 font-semibold tracking-tight">
                    {getFirstName(user?.name || 'Loading...')}
                </span>
            </div>
        </div>
    );
};

export const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { user: userData, signOut } = useSession();

    const handleLogout = async () => {
        router.push("/login");
        await signOut();
    };

    return (
        <div className="flex items-center">
            <UserGreeting user={userData as UserType} />
            <ProfileMenuDropdown
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                userData={userData}
                handleLogout={handleLogout}
            />
        </div>
    );
};

const ProfileMenuDropdown = ({ isOpen, setIsOpen, userData, handleLogout }: ProfileMenuProps) => {
    const router = useRouter();
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-300">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userData?.image || undefined} alt={userData?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-300">
                            {userData?.name ? getInitials(userData.name) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 p-2 backdrop-blur-xl bg-neutral-900/95 border border-neutral-700/50 rounded-xl shadow-2xl"
                align="end"
                forceMount
                sideOffset={8}
            >
                {/* User Profile Section */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/30">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={userData?.image || undefined} alt={userData?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-neutral-300">
                            {userData?.name ? getInitials(userData.name) : <User className="h-5 w-5" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-neutral-100 truncate">
                            {userData?.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                            {userData?.email}
                        </p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent my-2" />

                {/* Menu Items */}
                <div className="space-y-1">
                    <DropdownMenuItem
                        onClick={() => router.push("/settings")}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 hover:text-neutral-100 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/50 group-hover:bg-primary/20 transition-all duration-200">
                            <Settings className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-100">Settings</span>
                            <span className="text-xs text-neutral-500">Manage your account</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/50 group-hover:bg-red-500/20 transition-all duration-200">
                            <LogOut className="h-4 w-4 text-neutral-400 group-hover:text-red-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-100 group-hover:text-red-400">Sign out</span>
                            <span className="text-xs text-neutral-500">Log out of your account</span>
                        </div>
                    </DropdownMenuItem>
                </div>

                {/* Footer */}
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent mt-2" />
                <div className="px-3 py-2">
                    <p className="text-xs text-neutral-500 text-center">
                        Velora v1.0.0
                    </p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
