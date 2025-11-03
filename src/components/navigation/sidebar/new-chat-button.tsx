"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NewChatButton() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const createChatMutation = useMutation(trpc.chat.createChat.mutationOptions({
    onSuccess: (data: any) => {
      if (data.success && data.chat) {
        toast.success("New chat created!");
        
        // Invalidate and refetch the chat list to update the sidebar
        queryClient.invalidateQueries({
          queryKey: ['chat', 'getChats']
        });
        
        // Redirect to the new chat
        router.push(`/home/c/${data.chat.id}`);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to create chat", {
        description: error.message
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  }));

  const handleCreateChat = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    createChatMutation.mutate({});
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          size="lg" 
          onClick={handleCreateChat}
          disabled={isCreating}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 flex aspect-square size-8 items-center justify-center rounded-lg">
            <Plus className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {isCreating ? "Creating..." : "New Chat"}
            </span>
            <span className="truncate text-xs">
              Start a new conversation
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
