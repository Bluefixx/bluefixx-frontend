import React from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-300 rounded-xl bg-neutral-100",
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-3 bg-primary-100 rounded-full text-primary-900">
          {icon}
        </div>
      )}
      <h4 className="text-h5 font-semibold text-neutral-1000 mb-1">{title}</h4>
      {description && (
        <p className="text-b3 text-neutral-600 max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="solid" size="medium" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
