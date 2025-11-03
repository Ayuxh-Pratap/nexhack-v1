"use client"

import { ChevronRight, type LucideIcon, MoreVertical, Pin, Archive, Trash2, RefreshCw } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
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
    const router = useRouter()
    const params = useParams()
    const trpc = useTRPC()
    const [activeChatId, setActiveChatId] = useState<string | null>(null)

    // Fetch user's chats
    const { data: chatsData, isLoading: isLoadingChats, refetch: refetchChats } = useQuery(
        trpc.chat.getChats.queryOptions({
            includeArchived: false,
            limit: 20,
            offset: 0
        })
    )

    // Chat action mutations
    const pinChatMutation = useMutation(
        trpc.chat.pinChat.mutationOptions({
            onSuccess: (data: any) => {
                toast.success(data.message);
                refetchChats();
            },
            onError: (error: any) => {
                toast.error("Failed to pin/unpin chat");
                console.error("Pin chat error:", error);
            }
        })
    );

    const archiveChatMutation = useMutation(
        trpc.chat.archiveChat.mutationOptions({
            onSuccess: (data: any) => {
                toast.success(data.message);
                refetchChats();
            },
            onError: (error: any) => {
                toast.error("Failed to archive chat");
                console.error("Archive chat error:", error);
            }
        })
    );

    const deleteChatMutation = useMutation(
        trpc.chat.deleteChat.mutationOptions({
            onSuccess: (data: any) => {
                toast.success(data.message);
                refetchChats();
                // If we're currently viewing the deleted chat, redirect to home
                if (currentChatId === activeChatId) {
                    router.push('/home');
                }
            },
            onError: (error: any) => {
                toast.error("Failed to delete chat");
                console.error("Delete chat error:", error);
            }
        })
    );

    // Get current chat ID from URL
    const currentChatId = params?.chatId as string

    const handleChatClick = (chatId: string) => {
        setActiveChatId(chatId)
        router.push(`/home/c/${chatId}`)
    }

    const handleChatAction = async (action: 'pin' | 'archive' | 'delete', chatId: string) => {
        try {
            switch (action) {
                case 'pin':
                    await pinChatMutation.mutateAsync({ chatId });
                    break;
                case 'archive':
                    await archiveChatMutation.mutateAsync({ chatId });
                    break;
                case 'delete':
                    await deleteChatMutation.mutateAsync({ chatId });
                    break;
            }
        } catch (error) {
            console.error(`Failed to ${action} chat:`, error);
        }
    }

    // Transform chats data for the sidebar
    const chatItems = chatsData?.chats?.map(chat => ({
        title: chat.title || 'Untitled Chat',
        url: `/home/c/${chat.id}`,
        id: chat.id,
        isPinned: chat.isPinned,
        isArchived: chat.isArchived,
        lastMessageAt: chat.lastMessageAt
    })) || []

    // Debug logging
    console.log('Chats data:', chatsData);
    console.log('Is loading chats:', isLoadingChats);
    console.log('Chat items:', chatItems);

    return (
        <SidebarGroup>
            <NewChatButton />
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                            {item.title === "Chat" ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                                            <ChevronRight />
                                            <span className="sr-only">Toggle</span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="mr-0 pr-0">
                                            {isLoadingChats ? (
                                                <SidebarMenuSubItem>
                                                    <div className="flex items-center px-3 py-2 text-sm text-muted-foreground">
                                                        Loading chats...
                                                    </div>
                                                </SidebarMenuSubItem>
                                            ) : chatItems.length === 0 ? (
                                                <SidebarMenuSubItem>
                                                    <div className="flex items-center px-3 py-2 text-sm text-muted-foreground">
                                                        No chats yet
                                                    </div>
                                                </SidebarMenuSubItem>
                                            ) : (
                                                chatItems.map((chat) => (
                                                    <SidebarMenuSubItem key={chat.id}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={`group relative ${currentChatId === chat.id ? "bg-muted" : ""}`}
                                                        >
                                                            <a
                                                                href={chat.url}
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleChatClick(chat.id)
                                                                }}
                                                                className="flex items-center justify-between w-full pr-2"
                                                            >
                                                                <span className="truncate flex-1 text-left">
                                                                    {chat.title}
                                                                </span>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 pr-0 mr-0 hover:bg-muted rounded-md ml-2 min-w-[24px] h-6 flex items-center justify-center ring-0 focus:ring-0 focus:outline-none cursor-pointer">
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
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))
                                            )}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : item.items?.length ? (
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
                                                        <a href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </a>
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
    )
}
