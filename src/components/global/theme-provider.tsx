"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme, clickPosition?: { x: number; y: number }) => void;
  isTransitioning: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isTransitioning: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "velora-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage?.getItem(storageKey) as Theme) || defaultTheme
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPosition, setTransitionPosition] = useState({ x: 0, y: 0 });
  const [nextTheme, setNextTheme] = useState<Theme | null>(null);
  console.log(nextTheme);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme, clickPosition?: { x: number; y: number }) => {
    if (newTheme === theme || isTransitioning) return;

    setIsTransitioning(true);
    setNextTheme(newTheme);
    
    if (clickPosition) {
      setTransitionPosition(clickPosition);
    } else {
      // Default to center if no click position
      setTransitionPosition({ 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });
    }

    // Start the ripple effect
    setTimeout(() => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(newTheme);
      }

      setThemeState(newTheme);
      localStorage?.setItem(storageKey, newTheme);

      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        setNextTheme(null);
      }, 600);
    }, 100);
  };

  const value = {
    theme,
    setTheme,
    isTransitioning,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
      
      {/* Theme Transition Ripple */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none"
            initial={{
              background: `radial-gradient(circle at ${transitionPosition.x}px ${transitionPosition.y}px, 
                hsl(var(--background)) 0%, 
                transparent 0%)`,
            }}
            animate={{
              background: `radial-gradient(circle at ${transitionPosition.x}px ${transitionPosition.y}px, 
                hsl(var(--background)) 100%, 
                transparent 100%)`,
            }}
            exit={{
              background: `radial-gradient(circle at ${transitionPosition.x}px ${transitionPosition.y}px, 
                hsl(var(--background)) 100%, 
                transparent 100%)`,
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
            style={{
              background: `radial-gradient(circle at ${transitionPosition.x}px ${transitionPosition.y}px, 
                hsl(var(--background)) 0%, 
                transparent 0%)`,
            }}
          />
        )}
      </AnimatePresence>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
