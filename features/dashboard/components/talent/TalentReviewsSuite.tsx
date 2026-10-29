"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface TalentReviewsSuiteProps {
  onBack: () => void;
  onSubmitSuccess?: () => void;
  programmeTitle?: string;
  artisanName?: string;
  duration?: string;
}

export function TalentReviewsSuite({
  onBack,
  onSubmitSuccess,
  programmeTitle = "Welding & Metal Fabrication",
  artisanName = "John Obiora",
  duration = "3 months",
}: TalentReviewsSuiteProps) {
  const [viewState, setViewState] = useState<"pending" | "form" | "submitted">("form");
  const [rating, setRating] = useState(4);
  const [selectedChips, setSelectedChips] = useState<string[]>([
    "Patient mentor",
    "Safe workshop",
  ]);
  const [reviewText, setReviewText] = useState(
    "He teaches patiently and makes sure you can do each step yourself before moving on."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chips = [
    "Patient mentor",
    "Safe workshop",
    "Lots of hands-on practice",
    "Kept to schedule",
    "Fair assessment",
  ];

  const ratingLabels: Record<number, string> = {
    1: "1 out of 5 · Needs improvement",
    2: "2 out of 5 · Fair",
    3: "3 out of 5 · Good",
    4: "4 out of 5 · Very good",
    5: "5 out of 5 · Excellent",
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setViewState("submitted");
      toast.success("Review submitted! Thank you for your feedback.");
      onSubmitSuccess?.();
    }, 1000);
  };

  // 1. Pending Status View
  if (viewState === "pending") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16 select-none animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Progress</span>
        </button>

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
            My apprenticeship
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
            {programmeTitle} · Completed 30 Nov 2025
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                {programmeTitle} · {artisanName}
              </h3>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Review pending
              </span>
            </div>
            <p className="font-sans text-xs text-neutral-400">
              Completion 30 Nov · Certificate issued
            </p>
          </div>

          <button
            type="button"
            onClick={() => setViewState("form")}
            className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Review {artisanName.split(" ")[0]}
          </button>
        </div>
      </div>
    );
  }

  // 2. Submitted Confirmation
  if (viewState === "submitted") {
    return (
      <div className="space-y-6 max-w-xl mx-auto pb-16 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto text-2xl shadow-xs">
            ★
          </div>
          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-[#0F1115]">
              Review submitted
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your feedback is now visible on {artisanName}&apos;s profile and helps other talents discover great master artisans.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Back to my apprenticeship
          </button>
        </div>
      </div>
    );
  }

  // 3. Write a Review Form (Matching Figma Screenshot 6 Bottom Right)
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>My apprenticeship</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Review {artisanName}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          {programmeTitle} · {duration}
        </p>
      </div>

      {/* Main Form Grid: 8 cols Form + 4 cols Trust info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
          {/* Question 1: How was your training? */}
          <div className="space-y-2">
            <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
              How was your training?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                    rating >= star ? "text-amber-400" : "text-neutral-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="font-sans text-xs font-semibold text-neutral-600">
              {ratingLabels[rating]}
            </p>
          </div>

          {/* Question 2: What went well? */}
          <div className="space-y-2.5">
            <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
              What went well?
            </label>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => {
                const isSelected = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#001B40] text-white shadow-xs"
                        : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-neutral-700"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Your review */}
          <div className="space-y-2">
            <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
              Your review (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              placeholder="Share how your mentorship went, workshop conditions, and practical skills learned..."
              className="w-full p-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:border-[#001B40] focus:outline-hidden text-xs sm:text-sm text-neutral-800 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </form>

        {/* Right Info Sidecard */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
          <h3 className="font-heading font-bold text-base text-[#0F1115]">
            Reviews build trust
          </h3>
          <p className="font-sans text-xs text-neutral-500 leading-relaxed">
            Your review will appear on John&apos;s master profile. Constructive feedback helps future apprentices find the right trade mentor and reflects your completed training history.
          </p>
        </div>
      </div>
    </div>
  );
}
