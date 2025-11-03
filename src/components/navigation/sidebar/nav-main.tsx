"use client"

import { ChevronRight, type LucideIcon, MoreVertical, Pin, Archive, Trash2, BookOpen, MessageSquare } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewChatButton } from "./new-chat-button"

// Dummy course data
const dummyCourses = [
    {
        id: "course-1",
        title: "Complete React Development",
        url: "/home?course=course-1",
        progress: 45,
    },
    {
        id: "course-2",
        title: "JavaScript Fundamentals",
        url: "/home?course=course-2",
        progress: 75,
    },
    {
        id: "course-3",
        title: "TypeScript for Beginners",
        url: "/home?course=course-3",
        progress: 20,
    },
    {
        id: "course-4",
        title: "System Design Mastery",
        url: "/home?course=course-4",
        progress: 0,
    },
]

// Dummy chat data
const dummyChats = [
    {
        id: "chat-1",
        title: "Interview Prep Discussion",
        url: "/home/c/chat-1",
        isPinned: true,
    },
    {
        id: "chat-2",
        title: "DSA Problem Solving",
        url: "/home/c/chat-2",
        isPinned: false,
    },
    {
        id: "chat-3",
        title: "Career Guidance Session",
        url: "/home/c/chat-3",
        isPinned: false,
    },
    {
        id: "chat-4",
        title: "Higher Studies Advice",
        url: "/home/c/chat-4",
        isPinned: true,
    },
    {
        id: "chat-5",
        title: "Placement Strategy",
        url: "/home/c/chat-5",
        isPinned: false,
    },
]

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const params = useParams()

    // Get current chat ID from URL
    const currentChatId = params?.chatId as string

    const handleChatAction = (action: 'pin' | 'archive' | 'delete', chatId: string) => {
        toast.info(`${action.charAt(0).toUpperCase() + action.slice(1)} action - Coming soon!`)
    }

    return (
        <>
            <SidebarGroup>
                <NewChatButton />
            </SidebarGroup>
            
            {/* Courses Section */}
            <SidebarGroup>
                <SidebarGroupLabel>My Courses</SidebarGroupLabel>
                <SidebarMenu>
                    {dummyCourses.map((course) => (
                        <SidebarMenuItem key={course.id}>
                            <SidebarMenuButton 
                                asChild
                                className="w-full justify-start"
                            >
                                <Link href={course.url} className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate text-sm">{course.title}</span>
                                    </div>
                                    {course.progress > 0 && (
                                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                            {course.progress}%
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Chats Section */}
            <SidebarGroup>
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarMenu>
                    {dummyChats.map((chat) => (
                        <SidebarMenuItem key={chat.id}>
                            <SidebarMenuSubButton
                                asChild
                                className={`group relative w-full ${currentChatId === chat.id ? "bg-muted" : ""}`}
                            >
                                <Link
                                    href={chat.url}
                                    className="flex items-center justify-between w-full pr-2"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate text-sm">{chat.title}</span>
                                        {chat.isPinned && (
                                            <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-md min-w-[24px] h-6 flex items-center justify-center ring-0 focus:ring-0 focus:outline-none cursor-pointer">
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleChatAction('pin', chat.id)}>
                                                <Pin className="h-4 w-4 mr-3" />
                                                <span className="flex-1">{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleChatAction('archive', chat.id)}>
                                                <Archive className="h-4 w-4 mr-3" />
                                                <span className="flex-1">Archive</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleChatAction('delete', chat.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-3" />
                                                <span className="flex-1">Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Navigation Items (if any) */}
            {items.length > 0 && (
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => (
                            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                    <ChevronRight />
                                                    <span className="sr-only">Toggle</span>
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items?.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </>
                                    ) : null}
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    )
}
