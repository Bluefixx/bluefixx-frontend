import React from "react";
import { cn } from "@/lib/utils/cn";
import { ComponentVariant, ComponentSize } from "@/types/common";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  isLoading?: boolean;
}

const sizeClasses: Record<ComponentSize, string> = {
  giant: "btn-giant px-6 py-3 rounded-lg h-[54px]",
  large: "btn-large px-5 py-2.5 rounded-lg h-[44px]",
  medium: "btn-medium px-4 py-2 rounded-md h-[38px]",
  small: "btn-small px-3 py-1.5 rounded-md h-[32px]",
  tiny: "btn-tiny px-2 py-1 rounded-sm h-[26px]",
};

const variantClasses: Record<ComponentVariant, string> = {
  solid:
    "bg-primary-900 text-white hover:bg-primary-800 border border-transparent disabled:bg-primary-200 disabled:cursor-not-allowed",
  outlined:
    "bg-transparent text-primary-900 border-[2px] border-primary-900 hover:bg-primary-100 disabled:border-primary-200 disabled:text-primary-200 disabled:cursor-not-allowed",
  white:
    "bg-white text-neutral-1000 hover:bg-neutral-200 border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed",
};

export default function Button({
  id,
  variant = "solid",
  size = "medium",
  children,
  className = "",
  type = "button",
  disabled = false,
  isLoading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center font-sans font-semibold transition-all cursor-pointer duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
