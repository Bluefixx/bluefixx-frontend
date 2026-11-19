"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  label: string;
  value: string;
}

interface OpsDropdownProps {
  label?: string;
  value: string;
  options: (string | DropdownOption)[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  align?: "left" | "right";
  direction?: "down" | "up";
  disabled?: boolean;
}

export function OpsDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  menuClassName = "",
  align = "left",
  direction = "down",
  disabled = false,
}: OpsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => opt.value.toLowerCase() === value.toLowerCase()
  );

  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#001B40] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
          } ${
            align === "right" ? "right-0" : "left-0"
          } min-w-[140px] w-full max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100 ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected =
              opt.value.toLowerCase() === value.toLowerCase();

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#001B40] text-white font-semibold"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
