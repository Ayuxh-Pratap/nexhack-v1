"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/global/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, isTransitioning } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system", event: React.MouseEvent) => {
    if (isTransitioning) return;
    
    const clickPosition = {
      x: event.clientX,
      y: event.clientY,
    };
    
    setTheme(newTheme, clickPosition);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative"
          disabled={isTransitioning}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={(e) => handleThemeChange("light", e)}
          disabled={isTransitioning}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => handleThemeChange("dark", e)}
          disabled={isTransitioning}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => handleThemeChange("system", e)}
          disabled={isTransitioning}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
