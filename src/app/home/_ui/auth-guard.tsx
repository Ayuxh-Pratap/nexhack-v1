"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Give auth state time to initialize
    if (!isLoading) {
      setHasChecked(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (hasChecked && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasChecked, router]);

  // Show loading while checking auth or before first check
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated (will be handled by useEffect)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

