"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const themeOptions = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "系统", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const currentOption =
    themeOptions.find((opt) => opt.value === theme) || themeOptions[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 h-8 rounded-full bg-news-accent border border-news-border hover:bg-paper-200 dark:hover:bg-paper-700 transition-colors"
        aria-label="切换主题"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon className="w-4 h-4 text-news-text" />
        <ChevronDown
          className={`w-3 h-3 text-news-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 py-1 bg-card border border-news-border rounded-lg shadow-lg min-w-[120px] z-50"
          role="listbox"
          aria-label="主题选项"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-paper-100 dark:hover:bg-paper-700 transition-colors ${
                  isActive ? "text-finance-rise" : "text-news-text"
                }`}
                role="option"
                aria-selected={isActive}
              >
                <Icon className="w-4 h-4" />
                <span className="font-['Source_Sans_3']">{option.label}</span>
                {isActive && (
                  <span className="ml-auto text-finance-rise">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

