"use client";

import { useState } from "react";
import { X, Settings, Sun, Edit, CreditCard, Shield, Trash2, Check, Pencil, Loader2, Moon, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// tRPC removed - will use RTK Query later
import { useTheme } from "@/components/global/theme-provider";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: {
        name?: string;
        email?: string;
        image?: string;
    };
}

const TABS = [
    { value: "general", title: "General", icon: Settings },
    { value: "theme", title: "Theme", icon: Sun },
    { value: "behavior", title: "Behavior", icon: Edit },
    { value: "billing", title: "Billing", icon: CreditCard },
    { value: "security", title: "Security", icon: Shield },
] as const;

const THEME_OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsModal({ open, onOpenChange, user }: SettingsModalProps) {
    const [isActive, setIsActive] = useState<string>("general");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || "");
    const [localUserName, setLocalUserName] = useState(user?.name || "");

    const { theme, setTheme, isTransitioning } = useTheme();

    // Dummy function to update profile (will be replaced with RTK Query later)
    const updateProfile = {
        mutate: async (data: { name: string; email: string }) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // Update local state
            setLocalUserName(data.name);
            setIsEditingName(false);
            toast.success("Profile updated successfully", { description: `Your name has been updated to "${data.name}"` });
        },
        isPending: false
    };

    const handleDeleteAllChats = () => {
        // TODO: Implement delete all chats functionality
        console.log("Delete all chats");
    };

    const handleEditName = () => {
        setIsEditingName(true);
        setEditedName(localUserName || "");
    };

    const handleSaveName = async () => {
        if (!editedName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            await updateProfile.mutate({
                name: editedName.trim(),
                email: user?.email || ""
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Failed to update profile");
            } else {
                toast.error("Failed to update profile");
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName(localUserName || "");
    };

    const handleThemeChange = (newTheme: "light" | "dark" | "system", event: React.MouseEvent) => {
        if (isTransitioning) return;

        const clickPosition = {
            x: event.clientX,
            y: event.clientY,
        };

        setTheme(newTheme, clickPosition);
        toast.success("Theme updated", { description: `Switched to ${newTheme} theme` });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col w-full md:rounded-2xl sm:max-w-3xl h-96 p-4">
                <DialogHeader className="sr-only">
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                {/* Header */}
                <div className="flex items-center justify-between w-full pb-4 border-b border-border">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Settings
                        <span className="text-sm text-muted-foreground font-normal">
                            (Beta)
                        </span>
                    </h2>
                    {/* <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="focus-visible:ring-0 focus-visible:ring-transparent"
                    >
                        <X className="w-4 h-4" />
                    </Button> */}
                </div>

                {/* Content */}
                <div className="w-full h-full">
                    <Tabs
                        value={isActive}
                        defaultValue="general"
                        onValueChange={(value) => setIsActive(value)}
                        orientation="horizontal"
                        aria-orientation="horizontal"
                        className="flex flex-col w-full gap-6"
                    >
                        {/* Tabs List - Horizontal */}
                        <TabsList aria-orientation="horizontal" className="grid w-full grid-cols-5">
                            {TABS.map((tab) => {
                                return (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => setIsActive(tab.value)}
                                        className="flex items-center gap-x-2"
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.title}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {/* Tabs Content */}
                        <div className="flex-1 w-full px-1 sm:px-0">
                            {/* General Tab */}
                            <TabsContent value="general" className="flex flex-col py-2">
                                <div className="flex flex-col pb-4 border-b border-border">
                                    <span className="text-sm font-medium">Profile</span>
                                    <div className="flex items-center gap-x-2 group">
                                        <div className="mt-2 w-14 h-14">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={user?.image || ""} alt={localUserName || "User"} />
                                                <AvatarFallback className="bg-green-500 text-white">
                                                    {localUserName?.charAt(0).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="ml-4 flex flex-col flex-1">
                                            {isEditingName ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={editedName || user?.name || ""}
                                                        onChange={(e) => setEditedName(e.target.value)}
                                                        className="h-8 text-sm font-medium ring-0 focus-visible:ring-0 focus-visible:ring-transparent"
                                                        autoFocus
                                                        disabled={updateProfile.isPending}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !updateProfile.isPending) {
                                                                handleSaveName();
                                                            } else if (e.key === "Escape") {
                                                                handleCancelEdit();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleSaveName}
                                                        disabled={updateProfile.isPending}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {updateProfile.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCancelEdit}
                                                        disabled={updateProfile.isPending}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium capitalize">
                                                        {localUserName || user?.name || "User"}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleEditName}
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <span className="text-sm text-muted-foreground">
                                                {user?.email || "user@example.com"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full py-4 border-b border-border">
                                    <span className="text-sm font-medium">Language</span>
                                    <span className="pr-2 text-sm text-muted-foreground">English</span>
                                </div>

                                <div className="flex items-center justify-between w-full mt-4">
                                    <span className="text-sm font-medium">Delete all chats</span>
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteAllChats}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete all
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Theme Tab */}
                            <TabsContent value="theme" className="flex flex-col py-2">
                                <div className="flex items-center justify-between w-full py-4 border-b border-border">
                                    <span className="text-sm font-medium">Appearance</span>
                                </div>

                                <div className="flex items-center justify-between w-full mt-4">
                                    <span className="text-sm font-medium">Theme</span>
                                    <div className="flex items-center gap-2">
                                        {THEME_OPTIONS.map((option) => {
                                            const Icon = option.icon;
                                            const isActive = theme === option.value;
                                            return (
                                                <Button
                                                    key={option.value}
                                                    variant={isActive ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 w-8 p-0",
                                                        isActive && "bg-primary text-primary-foreground"
                                                    )}
                                                    onClick={(e) => handleThemeChange(option.value as "light" | "dark" | "system", e)}
                                                    disabled={isTransitioning}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Behavior Tab */}
                            <TabsContent value="behavior">
                                <div className="flex items-center justify-between w-full py-1">
                                    <span className="text-sm font-medium">Voice</span>
                                    <div className="pr-2 text-sm text-muted-foreground">
                                        <Button size="sm" variant="ghost">
                                            Select a voice
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full mt-4 py-1">
                                    <span className="text-sm font-medium">Creativity</span>
                                    <div className="pr-2 text-sm text-muted-foreground">
                                        {/* Slider would go here */}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing">
                                <div className="flex flex-col items-start w-full py-2">
                                    <span className="text-sm font-medium">Billing</span>
                                    <div className="pr-2 text-sm w-full">
                                        {/* Billing content would go here */}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security">
                                <div className="flex items-center justify-between w-full gap-8 py-2 border-b border-border">
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">Two-factor authentication</span>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Add an extra layer of security to your account by requiring a one-time code when signing in.
                                        </p>
                                    </div>
                                    <Button size="sm" type="button" variant="outline">
                                        Enable
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between w-full gap-8 py-4">
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">Logout of all devices</span>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Logout of all active sessions across all devices, including your current session. It may take a few minutes to complete.
                                        </p>
                                    </div>
                                    <Button size="sm" type="button" variant="outline">
                                        Log out
                                    </Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
