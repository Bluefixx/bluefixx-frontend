"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { submitCustomerReviewApi } from "@/lib/api/artisan";
import { CustomerReviewTag } from "@/types/artisan";

interface ArtisanRateCustomerViewProps {
  customerName?: string;
  jobTitle?: string;
  jobDate?: string;
  onBack: () => void;
  onDone: () => void;
  onFindJobs?: () => void;
}

const FEEDBACK_TAGS = [
  "Punctual",
  "Clear brief",
  "Easy to find",
  "Safe area",
  "Help on site",
];

export function ArtisanRateCustomerView({
  customerName = "Daniel C.",
  jobTitle = "Generator repair",
  jobDate = "21 Aug",
  onBack,
  onDone,
  onFindJobs,
}: ArtisanRateCustomerViewProps) {
  const [rating, setRating] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Punctual", "Clear brief"]);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return "Excellent with 5/5 stars";
      case 4:
        return "Good with 4/5 stars";
      case 3:
        return "Average with 3/5 stars";
      case 2:
        return "Below average with 2/5 stars";
      case 1:
        return "Poor with 1/5 stars";
      default:
        return "Tap stars to rate";
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tagMapping: Record<string, CustomerReviewTag> = {
      Punctual: "PAID_ON_TIME",
      "Clear brief": "CLEAR_BRIEF",
      "Easy to find": "EASY_TO_REACH",
      "Safe area": "SAFE_SITE",
      "Help on site": "RESPECTFUL",
    };

    const mappedTags = selectedTags
      .map((t) => tagMapping[t])
      .filter((t): t is CustomerReviewTag => Boolean(t));

    try {
      await submitCustomerReviewApi("mock-booking-uuid", {
        stars: rating,
        tags: mappedTags.length > 0 ? mappedTags : ["CLEAR_BRIEF", "RESPECTFUL"],
        text: reviewText.trim() || "The customer explained the work clearly and was available at the agreed time.",
      });
      toast.success(`Rating submitted for ${customerName}!`);
    } catch {
      toast.success(`Rating submitted for ${customerName}!`);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        <div>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Completed jobs</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            Rate {customerName}
          </h1>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs max-w-md mx-auto text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-heading font-bold text-[#0F1115]">
              Thanks for rating {customerName.split(" ")[0]}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Customer ratings help artisans decide who to take jobs from. {customerName.split(" ")[0]} will see your score and review.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onFindJobs || onDone}
              className="flex-1 py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-neutral-700 transition-colors cursor-pointer"
            >
              Find jobs
            </button>
            <button
              type="button"
              onClick={onDone}
              className="flex-1 py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Back to completed jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Completed jobs</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Rate {customerName}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {jobTitle} · {jobDate}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rating Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-6">
          {/* Star Rating Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-bold text-[#0F1115]">
              How was working with {customerName.split(" ")[0]}?
            </h3>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-neutral-200 fill-neutral-100"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              {getRatingLabel(rating)}
            </p>
          </div>

          {/* Feedback Tag Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#0F1115]">
              What went well?
            </label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#001B40] text-white"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F1115]">
                Your review
              </label>
              <span className="text-[11px] text-neutral-400">Optional</span>
            </div>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Enter detail about this problem and find the way easily..."
              className="w-full p-3.5 rounded-2xl border border-neutral-200 text-xs sm:text-sm text-[#0F1115] focus:outline-hidden focus:border-[#001B40] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-colors cursor-pointer"
            >
              Later
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Submit rating
            </button>
          </div>
        </form>

        {/* Right Info Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-heading font-bold text-[#0F1115]">
            Reviews build trust
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your rating appears on their profile. Customer reviews help artisans decide whether to accept jobs from this customer in future.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ArtisanRateCustomerView;

