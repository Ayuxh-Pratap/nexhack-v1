"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NewChatButton() {
  const router = useRouter();

  const handleBrowseCourses = () => {
    router.push("/home/browse");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          size="lg" 
          onClick={handleBrowseCourses}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
            <BookOpen className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              Browse Course
            </span>
            <span className="truncate text-xs">
              Explore available courses
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
