"use client";

import React from "react";
import Image from "next/image";
import { IntroSlideData } from "../types";

interface IntroSlideProps {
  slide: IntroSlideData;
  currentIndex: number;
  totalSlides: number;
  onContinue: () => void;
  onDotClick: (index: number) => void;
}

export default function IntroSlide({
  slide,
  currentIndex,
  totalSlides,
  onContinue,
  onDotClick,
}: IntroSlideProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      {/* Left Column: Visual Artwork Card */}
      <div className="relative w-full max-w-[500px] lg:max-w-[540px] aspect-[4/4.5] sm:aspect-[4/4.3] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-md mx-auto select-none bg-neutral-100">
        {/* Main Illustration */}
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 540px"
          className="object-cover object-center"
        />

        {/* Top-Left Verified Badge */}
        <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-white/60 shadow-sm">
            {/* Shield Check Icon */}
            <svg
              className="w-3.5 h-3.5 text-[#001B40]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="font-sans font-bold text-[10px] sm:text-[11px] tracking-wider text-[#001B40] uppercase">
              {slide.badgeLabel}
            </span>
          </div>
        </div>

        {/* Bottom-Left Frosted Overlay Card */}
        <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 z-10 max-w-[270px] sm:max-w-[300px]">
          <div className="bg-[#001B40]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-white shadow-xl">
            <h4 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-white">
              {slide.statNumber}
            </h4>
            <p className="font-sans text-xs sm:text-[13px] text-neutral-200 mt-1 leading-snug">
              {slide.statLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Information & Controls */}
      <div className="flex flex-col justify-center max-w-lg mx-auto lg:mx-0 w-full">
        {/* Category Tag */}
        <span className="font-sans font-bold text-xs sm:text-[13px] tracking-[0.14em] text-neutral-600 uppercase mb-3">
          {slide.tag}
        </span>

        {/* Big Headline */}
        <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#0F1115] leading-[1.18] tracking-tight mb-4 sm:mb-5">
          {slide.title}
        </h2>

        {/* Description Body */}
        <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 sm:mb-8">
          {slide.description}
        </p>

        {/* Feature Callout Box */}
        <div className="bg-[#F0F5FA] rounded-xl p-3.5 sm:p-4 flex items-center gap-3 border border-blue-100/40 mb-8 sm:mb-12">
          <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center shrink-0 text-neutral-700">
            <svg
              className="w-3 h-3 text-neutral-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-sans text-xs sm:text-sm font-medium text-neutral-800 leading-snug">
            {slide.callout}
          </p>
        </div>

        {/* Bottom Navigation Row: Carousel Dots + Continue Button */}
        <div className="flex items-center justify-between pt-2">
          {/* Carousel Step Indicators */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding slides">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onDotClick(idx)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-6 sm:w-7 h-2 bg-[#001B40] rounded-full"
                      : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400 rounded-full"
                  }`}
                />
              );
            })}
          </div>

          {/* Continue CTA Button */}
          <button
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-lg bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.98] text-white font-sans font-semibold text-sm sm:text-base transition-all shadow-sm cursor-pointer select-none"
          >
            <span>Continue</span>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
