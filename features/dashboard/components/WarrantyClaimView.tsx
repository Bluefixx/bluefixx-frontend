"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface WarrantyClaimViewProps {
  onBack?: () => void;
  onSubmitSuccess: () => void;
  jobId?: string;
  jobTitle?: string;
  artisanName?: string;
  protectionPeriod?: string;
}

export default function WarrantyClaimView({
  onBack,
  onSubmitSuccess,
  jobId = "BFX-20481",
  jobTitle = "Bathroom Plumbing Repair",
  artisanName = "Emeka Okafor",
  protectionPeriod = "Protected until 24 Aug · 09:39 · Covered under warranty",
}: WarrantyClaimViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>("The leak is back");
  const [problemDescription, setProblemDescription] = useState<string>(
    "Water is dripping from the new p-trap joint under the sink since this morning."
  );
  const [photosCount, setPhotosCount] = useState<number>(1);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const issueOptions = [
    "The leak is back",
    "Part stopped working",
    "Damage from the repair",
    "Work left unfinished",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      toast.error("Please provide a description of the issue.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Warranty claim submitted successfully.");
      onSubmitSuccess();
    }, 700);
  };

  const handleAddPhotos = () => {
    setPhotosCount((prev) => prev + 1);
    toast.success("Photo attached to warranty report.");
  };

  const handleAddVideo = () => {
    setHasVideo(true);
    toast.success("Video attached to warranty report.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{jobTitle}</span>
        </button>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Report an issue under warranty
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-1">
          {protectionPeriod}
        </p>
      </div>

      {/* Main Grid: Form on Left, Info on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Card: Form */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* What is wrong? Chips */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2.5">
                What is wrong?
              </label>
              <div className="flex flex-wrap gap-2">
                {issueOptions.map((opt) => {
                  const isSelected = selectedIssue === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedIssue(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#001B40] text-white shadow-2xs"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Describe the problem */}
            <div>
              <label htmlFor="problem-desc" className="block text-xs font-semibold text-neutral-600 mb-2">
                Describe the problem
              </label>
              <textarea
                id="problem-desc"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Explain the recurring problem or defect..."
                rows={4}
                className="w-full rounded-2xl border border-neutral-200 p-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#001B40] transition-colors resize-none"
              />
            </div>

            {/* Photo / Video upload buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAddPhotos}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Add Photo(s) {photosCount > 0 && `(${photosCount})`}</span>
              </button>

              <button
                type="button"
                onClick={handleAddVideo}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Add Video {hasVideo && "(1)"}</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Claim..." : `Send to ${artisanName.split(" ")[0]} and Bluefixx`}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: How the warranty works */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h3 className="font-heading font-bold text-sm text-[#001B40]">
            How the warranty works
          </h3>

          <p className="font-sans text-xs text-neutral-500 leading-relaxed">
            {artisanName.split(" ")[0]} has 24 hours to respond and book a return visit at no extra cost. If he does not, Bluefixx steps in to arrange a second verified artisan.
          </p>
        </div>
      </div>
    </div>
  );
}
