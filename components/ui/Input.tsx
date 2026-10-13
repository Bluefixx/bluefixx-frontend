import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  containerClassName?: string;
}

export default function Input({
  label,
  id,
  error,
  helperText,
  startIcon,
  className = "",
  containerClassName = "",
  disabled,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

  return (
    <div className={cn("flex flex-col w-full text-left", containerClassName)}>
      <label
        htmlFor={inputId}
        className="block font-sans font-medium text-b3 text-neutral-800 mb-1.5"
      >
        {label}
      </label>
      <div className="relative w-full">
        {startIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500 pointer-events-none">
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          className={cn(
            "w-full bg-neutral-100 border border-neutral-400 rounded-lg py-2.5 px-3.5 text-b2 text-neutral-1000 placeholder:text-neutral-500 transition-colors focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed",
            startIcon ? "pl-10" : undefined,
            error ? "border-red-200 focus:border-red-200 focus:ring-red-200" : undefined,
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-c1 text-red-200 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-c1 text-neutral-600">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
