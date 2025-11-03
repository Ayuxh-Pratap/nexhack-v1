"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

interface LoginMenuProps {
  variant?: "default" | "mobile";
}

export const LoginMenu = ({ variant = "default" }: LoginMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const signinWithGithub = async () => {
    await authClient.signIn.social({
      callbackURL: "/",
      provider: "github",
    });
  };

  const signinWithGoogle = async () => {
    await authClient.signIn.social({
      callbackURL: "/",
      provider: "google",
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size={variant === "mobile" ? "lg" : "sm"} 
          variant="outline" 
          className={`hover:bg-accent/50 transition-all duration-300 ${variant === "mobile" ? "w-full" : ""}`}
        >
          Login
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 p-2 backdrop-blur-xl bg-neutral-900/95 border border-neutral-700/50 rounded-xl shadow-2xl" 
        align="end" 
        forceMount
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/30">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800">
            <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-neutral-100">Welcome back</p>
            <p className="text-xs text-neutral-400">Sign in to your account</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent my-2" />

        {/* Login Options */}
        <div className="space-y-1">
          <DropdownMenuItem 
            onClick={signinWithGoogle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 hover:text-neutral-100 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white group-hover:bg-blue-50 transition-all duration-200">
              <FcGoogle className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-100">Continue with Google</span>
              <span className="text-xs text-neutral-500">Sign in with your Google account</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={signinWithGithub}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 hover:text-neutral-100 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/50 transition-all bg-purple-500/30 duration-200">
              <FaGithub className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-100">Continue with GitHub</span>
              <span className="text-xs text-neutral-500">Sign in with your GitHub account</span>
            </div>
          </DropdownMenuItem>
        </div>

        {/* Footer */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent mt-2" />
        <div className="px-3 py-2">
          <p className="text-xs text-neutral-500 text-center">
            Secure authentication powered by OAuth
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
