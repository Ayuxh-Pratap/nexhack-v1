import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Shimmer = ({ className, children }: ShimmerProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200/50 dark:bg-gray-800/50",
        className
      )}
    >
      {children}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/20" />
    </div>
  );
};

export const ShimmerAvatar = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full border border-gray-200/20 dark:border-gray-700/20 animate-[pulse-subtle_2s_ease-in-out_infinite]", className)}>
      <Shimmer className="aspect-square size-full rounded-full" />
    </div>
  );
};

// Shimmer avatar that matches the exact button structure of the profile menu
export const ShimmerProfileButton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("inline-flex items-center justify-center h-8 w-8 rounded-full transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50", className)}>
      <ShimmerAvatar />
    </div>
  );
};

export const ShimmerButton = ({ className }: { className?: string }) => {
  return (
    <Shimmer className={cn("h-10 w-full rounded-md", className)} />
  );
};

// Shimmer for the complete profile menu (greeting + avatar)
export const ShimmerProfileMenu = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center", className)}>
      {/* Greeting shimmer */}
      <div className="hidden lg:flex items-center mr-4">
        <div className="flex flex-col items-end gap-1">
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="h-4 w-20 rounded" />
        </div>
      </div>
      {/* Avatar shimmer */}
      <ShimmerAvatar />
    </div>
  );
};
