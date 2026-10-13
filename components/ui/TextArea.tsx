import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export default function TextArea({
  label,
  id,
  error,
  helperText,
  className = "",
  containerClassName = "",
  disabled,
  rows = 4,
  ...props
}: TextAreaProps) {
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
      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        className={cn(
          "w-full bg-neutral-100 border border-neutral-400 rounded-lg py-2.5 px-3.5 text-b2 text-neutral-1000 placeholder:text-neutral-500 transition-colors focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 resize-y disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed",
          error && "border-red-200 focus:border-red-200 focus:ring-red-200",
          className
        )}
        {...props}
      />
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
