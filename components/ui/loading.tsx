import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function Loading({
  text = "加载中...",
  className,
  showIcon = true,
  size = "md",
}: LoadingProps) {
  return (
    <div
      className={cn(
        "h-full flex items-center justify-center text-news-muted font-['Source_Sans_3']",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Loader2 className={cn("mr-2 animate-spin", iconSizes[size])} />
      )}
      {text}
    </div>
  );
}

// 全屏加载组件
export function FullScreenLoading({
  text = "加载中...",
  className,
}: Omit<LoadingProps, "size">) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading text={text} className={className} size="lg" />
    </div>
  );
}

// 行内加载组件
export function InlineLoading({
  text = "加载中...",
  className,
}: Omit<LoadingProps, "size">) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-news-muted font-['Source_Sans_3'] text-sm",
        className
      )}
    >
      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      {text}
    </span>
  );
}
