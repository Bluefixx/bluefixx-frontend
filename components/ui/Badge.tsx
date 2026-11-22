import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
  size?: "small" | "medium";
}

const variantClasses = {
  primary: "bg-primary-100 text-primary-900 border-primary-200",
  secondary: "bg-secondary-100 text-secondary-700 border-secondary-200",
  neutral: "bg-neutral-200 text-neutral-800 border-neutral-300",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

const sizeClasses = {
  small: "text-c2 px-2 py-0.5",
  medium: "text-c1 px-2.5 py-1",
};

export default function Badge({
  className = "",
  variant = "primary",
  size = "medium",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap shrink-0 rounded-full font-medium border transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
