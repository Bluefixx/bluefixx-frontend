"use client";

import React, { useState, useRef, useEffect } from "react";
import { COUNTRY_CODES, CountryCode } from "@/lib/utils/phone";

interface PhoneInputProps {
  /** The raw national number, e.g. "0803 245 0182" */
  value: string;
  onChange: (value: string) => void;
  /** Currently selected country code, e.g. "+234" */
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  /** Field label text */
  label?: string;
  /** Error message to display */
  error?: string | null;
  /** Optional className override for the outer wrapper */
  className?: string;
  id?: string;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  placeholder = "803 245 0182",
  label = "Phone number",
  error,
  className = "",
  id,
}: PhoneInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const filteredCodes = search
    ? COUNTRY_CODES.filter(
        (c) =>
          c.country.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search) ||
          c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSearch("");
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  const handleSelect = (c: CountryCode) => {
    onCountryCodeChange(c.code);
    setDropdownOpen(false);
    setSearch("");
  };

  return (
    <div className={`flex flex-col text-left ${className}`}>
      {label && (
        <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex w-full" ref={dropdownRef}>
        {/* Country Code Button */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-l-xl border border-r-0 transition-colors cursor-pointer ${
            error
              ? "border-red-500 bg-red-50/30"
              : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
          }`}
          aria-label="Select country code"
          aria-expanded={dropdownOpen}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span className="font-sans text-xs sm:text-sm font-semibold text-neutral-800">
            {selectedCountry.code}
          </span>
          <svg
            className={`w-3 h-3 text-neutral-500 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white rounded-r-xl py-2 pl-3 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-colors ${
            error
              ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border border-neutral-300 focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
          }`}
        />

        {/* Country Code Dropdown */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-neutral-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-1.5 px-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
              />
            </div>

            {/* Country List */}
            <div className="max-h-52 overflow-y-auto overscroll-contain">
              {filteredCodes.length === 0 ? (
                <div className="px-3 py-4 text-xs text-neutral-500 text-center">
                  No countries match your search.
                </div>
              ) : (
                filteredCodes.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
                      c.code === countryCode ? "bg-[#E6EFFB]" : ""
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {c.flag}
                    </span>
                    <span className="flex-1 font-sans text-xs sm:text-sm text-neutral-800 truncate">
                      {c.country}
                    </span>
                    <span className="font-sans text-xs font-medium text-neutral-500">
                      {c.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-red-500 font-medium flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
