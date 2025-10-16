"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  text?: string;
}

export function LoadingIndicator({ 
  size = "md", 
  variant = "spinner", 
  className,
  text = "Loading..."
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className="flex space-x-1">
          <div className={cn("bg-blue-600 rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: "0ms" }} />
          <div className={cn("bg-blue-600 rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: "150ms" }} />
          <div className={cn("bg-blue-600 rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: "300ms" }} />
        </div>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className={cn("bg-blue-600 rounded-full animate-pulse", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
}

export function PageLoadingIndicator({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingIndicator size="lg" text={text} />
    </div>
  );
}

export function InlineLoadingIndicator({ 
  text = "Loading...",
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LoadingIndicator size="md" text={text} />
    </div>
  );
}

export function ButtonLoadingIndicator() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}