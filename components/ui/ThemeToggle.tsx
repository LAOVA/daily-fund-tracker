"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted, isDark } = useTheme();

  if (!mounted) {
    return (
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-news-accent border border-news-border"
        aria-label="切换主题"
      >
        <Sun className="w-4 h-4 text-news-muted" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-news-accent border border-news-border hover:bg-paper-200 transition-colors"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-news-text" />
      ) : (
        <Moon className="w-4 h-4 text-news-text" />
      )}
    </button>
  );
}
