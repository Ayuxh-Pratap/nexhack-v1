"use client"

import * as React from "react"
import {
    Bot,
    Command,
    MessageSquare,
    Plus,
    Settings2,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react"

import { NavMain } from "@/components/navigation/sidebar/nav-main"
import { NavProjects } from "@/components/navigation/sidebar/nav-projects"
import { NavUser } from "@/components/navigation/sidebar/nav-user"
import { NewChatButton } from "@/components/navigation/sidebar/new-chat-button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/user.jpg",
    },
    navMain: [
        {
            title: "Chat",
            url: "#",
            icon: MessageSquare,
            isActive: true,
            items: [
                {
                    title: "Getting Started with AI",
                    url: "#",
                },
                {
                    title: "Code Review Help",
                    url: "#",
                },
                {
                    title: "Project Planning Discussion",
                    url: "#",
                },
                {
                    title: "Creative Writing Session",
                    url: "#",
                },
            ],
        },
        {
            title: "AI Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "GPT-4",
                    url: "#",
                },
                {
                    title: "Claude",
                    url: "#",
                },
                {
                    title: "Gemini",
                    url: "#",
                },
            ],
        },
        {
            title: "Team",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Shared Chats",
                    url: "#",
                },
                {
                    title: "Collaborations",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "AI Preferences",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Recent Chats",
            url: "#",
            icon: MessageSquare,
        },
        {
            name: "Starred",
            url: "#",
            icon: Sparkles,
        },
        {
            name: "Archived",
            url: "#",
            icon: Trash2,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            {/* <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Velora</span>
                                    <span className="truncate text-xs">AI Assistant</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader> */}
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
