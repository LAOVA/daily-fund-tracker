"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({
  title = "加载失败",
  message,
  onRetry,
  retryText = "重试",
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-finance-rise" />
      </div>
      <h3 className="font-['Libre_Baskerville'] text-lg font-bold text-news-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-news-muted font-['Source_Sans_3'] mb-4 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-news-text hover:bg-news-text hover:text-white font-['Source_Sans_3']"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
}

interface LoadingErrorProps {
  error: Error | string;
  onRetry?: () => void;
}

export function LoadingError({ error, onRetry }: LoadingErrorProps) {
  const message = typeof error === "string" ? error : error.message || "数据加载失败，请稍后重试";

  return (
    <ErrorMessage
      title="数据加载失败"
      message={message}
      onRetry={onRetry}
    />
  );
}
