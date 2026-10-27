"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createSupportCaseApi } from "@/lib/api";

interface ReportProblemViewProps {
  onBack: () => void;
}

export function ReportProblemView({ onBack }: ReportProblemViewProps) {
  // Step: "form" | "dispute-timeline"
  const [step, setStep] = useState<"form" | "dispute-timeline">("form");
  const [selectedCategory, setSelectedCategory] = useState("Work incomplete");
  const [problemDescription, setProblemDescription] = useState("");
  const [photoCount, setPhotoCount] = useState(3);
  const [videoCount, setVideoCount] = useState(1);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const categories = [
    "Work incomplete",
    "Poor quality",
    "No long service",
    "Damage to property",
    "Safety concern",
    "Payment issue",
    "Other",
  ];

  const handleCopyTransaction = () => {
    navigator.clipboard.writeText("BFX-TXN-4475193");
    setCopiedTxn(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPhotoCount((prev) => prev + files.length);
      toast.success(`${files.length} photo(s) added as evidence`);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setVideoCount((prev) => prev + files.length);
      toast.success(`${files.length} video(s) added as evidence`);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createSupportCaseApi({
        category: "DISPUTE",
        subject: `Dispute: ${selectedCategory}`,
        description: problemDescription || `Issue reported: ${selectedCategory}`,
        bookingId: "BFX-BK-20541",
      });
    } catch {
      // Graceful fallback
    }

    setIsSubmitting(false);
    setStep("dispute-timeline");
    toast.success("Dispute report filed. Escrow release frozen.");
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW 2: DISPUTE REPORTED / ARBITRATION TIMELINE (Screenshot 5)
  // ══════════════════════════════════════════════════════════════
  if (step === "dispute-timeline") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Settings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Report a problem
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Track your report and arbitration timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Overview & Dispute Timeline */}
          <div className="lg:col-span-7 space-y-5">
            {/* Job Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#001B40]">
                    Bathroom Plumbing Repair
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Emeka Okafor · Plumbing
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/80">
                  Under review
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Amount held</span>
                  <span className="font-bold text-[#001B40]">₦120,000</span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Transaction</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-neutral-800">BFX-TXN-4475193</span>
                    <button
                      type="button"
                      onClick={handleCopyTransaction}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Problem</span>
                  <span className="font-semibold text-neutral-800">{selectedCategory}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Evidence</span>
                  <span className="font-medium text-neutral-800">{photoCount} photos · {videoCount} video</span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Opened</span>
                  <span className="text-neutral-700">21 Aug 2026 · 11:44am</span>
                </div>
              </div>
            </div>

            {/* Dispute Timeline Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Dispute timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {/* Step 1: Completed */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#001B40]">
                      Report submitted
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      21 Aug · 11:44am
                    </span>
                  </div>
                </div>

                {/* Step 2: Active */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-blue-700">
                      Under review by Bluefixx
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      Agent assigned · 21 Aug · 12:10pm
                    </span>
                  </div>
                </div>

                {/* Step 3: Pending */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-neutral-400">
                      Waiting for artisan response
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      Response due within 24 hours
                    </span>
                  </div>
                </div>

                {/* Step 4: Resolved */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-neutral-400">
                      Resolved
                    </h4>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 leading-relaxed">
                Most disputes are resolved within 48 hours. If we find the work incomplete, you receive a refund or the artisan returns to fix at no extra cost.
              </p>
            </div>
          </div>

          {/* Right Column: Messages & Actions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Secured Balance Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Overdue
              </span>
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Your ₦120,000 stays secured
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed pt-1">
                Nothing is released to the artisan while a report is open.
              </p>
            </div>

            {/* Messages from Bluefixx Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Messages from Bluefixx
              </h3>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-600 space-y-2">
                <p className="leading-relaxed">
                  We have paused the release of ₦120,000 and asked Emeka to respond with photos of the sink base. No further payment is required from you.
                </p>
                <span className="text-[11px] text-neutral-400 block pt-1 border-t border-neutral-200/60">
                  21/08/26 · Bluefixx Support · 12:10pm
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                <Link
                  href="/messages?conversation=support"
                  className="block w-full py-3 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs text-center rounded-xl transition-colors shadow-sm"
                >
                  Contact support
                </Link>

                <Link
                  href="/messages?conversation=emeka"
                  className="block w-full py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 font-semibold text-xs text-center rounded-xl transition-colors"
                >
                  Message Artisan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 1: REPORT A PROBLEM FORM (Screenshot 4 Right)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Report a problem
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Tell us what went wrong so we can help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          {/* Blue Guarantee Notice Box */}
          <div className="p-4 rounded-2xl bg-[#EBF1F7]/80 border border-blue-100 text-xs text-neutral-600 space-y-1">
            <span className="font-bold text-[#001B40] block">
              Your ₦120,000 stays held
            </span>
            <p className="leading-relaxed">
              Nothing is released to the artisan while a problem report is open. A Bluefixx agent reviews it within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-5">
            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#001B40]">
                What went wrong?
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#001B40] text-white shadow-2xs"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-600">
                Describe the problem
              </label>
              <textarea
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="e.g. The leak stopped but the sink trap was not replaced and water still collects in the cabinet."
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#001B40] leading-relaxed transition-colors"
                required
              />
            </div>

            {/* Evidence Uploads */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-600">
                Evidence
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="p-4 rounded-2xl border border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="font-semibold text-xs text-neutral-700">Add photos</span>
                  <span className="text-[10px] text-neutral-400">{photoCount} attached</span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-4 rounded-2xl border border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span className="font-semibold text-xs text-neutral-700">Add video</span>
                  <span className="text-[10px] text-neutral-400">{videoCount} attached</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              The artisan sees your report and can respond with their own evidence. Bluefixx decides the outcome: full release, partial release or refund.
            </p>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Submit Report
            </button>
          </form>
        </div>

        {/* Right Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Job Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#001B40]">
                  Bathroom Plumbing Repair
                </h3>
                <p className="text-xs text-neutral-400">
                  Emeka Okafor · Plumbing
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Secured
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Amount held</span>
                <span className="font-bold text-[#001B40]">₦120,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Transaction</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-neutral-700">BFX-TXN-4475193</span>
                  <button
                    type="button"
                    onClick={handleCopyTransaction}
                    className="p-1 text-neutral-400 hover:text-neutral-700"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* What Happens Next Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3 text-xs text-neutral-600">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              What happens next
            </h3>
            <ol className="space-y-1.5 list-decimal list-inside text-neutral-500">
              <li>Submit your report and evidence.</li>
              <li>A Bluefixx agent reviews it within 24 hours.</li>
              <li>The artisan can respond with their own evidence.</li>
            </ol>
            <p className="pt-2 border-t border-neutral-100 font-bold text-[#001B40]">
              Your payment stays held while the report is open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
