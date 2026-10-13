import React from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-lg bg-red-100 border border-red-200 text-neutral-1000 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h5 className="font-semibold text-b2 text-red-700">{title}</h5>
        <p className="text-b3 text-neutral-700 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          onClick={onRetry}
          className="border-red-700 text-red-700 hover:bg-red-200 shrink-0"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
