"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export interface JobDetailData {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory: string;
  postedTime: string;
  isUrgent: boolean;
  status: string;
  description: string;
  service: string;
  date: string;
  time: string;
  budget: string;
  urgency: string;
  customerName: string;
  customerLocation: string;
  distance: string;
  driveTime: string;
  photoUrl: string;
  photoCaption: string;
  audioDuration: string;
  questions: Array<{ question: string; answer: string }>;
}

interface ArtisanJobDetailViewProps {
  job?: JobDetailData;
  isVerified?: boolean;
  onBack: () => void;
  onContinueVerification?: () => void;
  onSendQuote?: () => void;
  onAskQuestion?: () => void;
}

const defaultJobData: JobDetailData = {
  id: "job-kitchen-1",
  code: "BFX-72810",
  title: "Kitchen Plumbing Repair",
  category: "Plumbing",
  subCategory: "Pipe repair",
  postedTime: "posted 10 minutes ago",
  isUrgent: true,
  status: "Receiving Quotes",
  description:
    "Kitchen pipe underneath the sink is leaking. Water collects inside the cabinet every time we run the tap, and the wood is starting to swell.",
  service: "Plumbing · Pipe repair",
  date: "Tomorrow · Sat 23 Aug",
  time: "Morning · 9am - 12pm",
  budget: "₦25,000 - ₦65,000",
  urgency: "Urgent",
  customerName: "Daniel C.",
  customerLocation: "Enugu, Nigeria",
  distance: "approx 2.8 km away",
  driveTime: "8 min from your base",
  photoUrl: "/images/workers.png",
  photoCaption: "Leak under the sink",
  audioDuration: "0:41",
  questions: [
    { question: "Is water currently leaking?", answer: "Yes" },
    { question: "Is the affected area accessible?", answer: "Yes" },
  ],
};

export function ArtisanJobDetailView({
  job = defaultJobData,
  isVerified = false,
  onBack,
  onContinueVerification,
  onSendQuote,
  onAskQuestion,
}: ArtisanJobDetailViewProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      toast.success("Playing customer voice note...");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Find jobs</span>
        </button>
      </div>

      {/* Title & Badges Header */}
      <div className="space-y-2">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          {job.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-sans text-xs text-neutral-400 font-medium">
            {job.code} · {job.postedTime}
          </span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
            {job.status}
          </span>
          {job.isUrgent && (
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Content Layout (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: What the customer needs */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              What the customer needs
            </h2>
            <p className="font-sans text-sm text-neutral-700 leading-relaxed">
              {job.description}
            </p>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm pt-2">
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Service</span>
                <span className="font-semibold text-neutral-900">{job.service}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Date</span>
                <span className="font-semibold text-neutral-900">{job.date}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Time</span>
                <span className="font-semibold text-neutral-900">{job.time}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Budget</span>
                <span className="font-bold text-[#001B40]">{job.budget}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Urgency</span>
                <span className="font-semibold text-rose-600">{job.urgency}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Photos from the customer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Photos from the customer
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-neutral-100 aspect-video sm:aspect-[16/9] max-h-80 bg-neutral-100">
              <Image
                src={job.photoUrl}
                alt={job.photoCaption}
                fill
                className="object-cover"
              />
            </div>
            <p className="font-sans text-xs text-neutral-500 font-medium">
              {job.photoCaption}
            </p>
          </div>

          {/* Card 3: Voice note from the customer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Voice note from the customer
            </h2>

            {/* Audio Waveform Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                className="w-10 h-10 rounded-full bg-[#001B40] hover:bg-[#052F5F] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                aria-label={isPlayingAudio ? "Pause voice note" : "Play voice note"}
              >
                {isPlayingAudio ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              {/* Simulated Waveform Visual */}
              <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden">
                {[12, 24, 18, 30, 16, 8, 22, 28, 14, 20, 26, 18, 12, 30, 24, 16, 22, 28, 10, 16, 24, 18, 14, 8].map(
                  (height, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlayingAudio && i % 3 === 0
                          ? "bg-[#001B40] animate-pulse"
                          : "bg-neutral-300"
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  )
                )}
              </div>

              <span className="font-sans text-xs font-semibold text-neutral-500 shrink-0">
                {job.audioDuration}
              </span>
            </div>

            <p className="font-sans text-xs text-neutral-400">
              Recorded by {job.customerName} when posting the job. Listen before you quote.
            </p>
          </div>

          {/* Alert Notice Banner (Matching Screenshot 5 Left) */}
          <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3">
            <svg className="w-5 h-5 text-[#001B40] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="font-sans text-xs text-[#001B40] leading-relaxed">
              {isVerified
                ? "After you send a quote the customer compares it with others. If they accept, payment is secured before you travel; you never work unpaid."
                : "You can view the full request now. Quoting opens as soon as your identity is verified, so you are ready the moment it does."}
            </p>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Customer Summary */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-heading font-extrabold text-sm shrink-0">
                DC
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0F1115]">
                  {job.customerName}
                </h3>
                <span className="font-sans text-xs text-neutral-400 block">
                  {job.customerLocation}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                Budget
              </span>
              <span className="font-heading font-extrabold text-lg text-[#001B40]">
                {job.budget}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="font-sans text-[11px] text-neutral-500 leading-snug">
                Customers have card/bank money held in escrow the moment they accept your quote and secure payment.
              </p>
            </div>
          </div>

          {/* Card 2: Quoting Action Box */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            {!isVerified ? (
              <>
                {/* Amber Locked Callout */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-sans font-bold text-xs">
                    <span>🔒</span>
                    <span>Verify your identity to quote</span>
                  </div>
                  <p className="font-sans text-xs text-amber-800 leading-snug">
                    2 of 4 steps done. It takes about 2 to 3 minutes to finish.
                  </p>
                  <button
                    type="button"
                    onClick={onContinueVerification || (() => toast("Redirecting to verification..."))}
                    className="font-sans text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-block pt-1 cursor-pointer"
                  >
                    Continue verification →
                  </button>
                </div>

                {/* Disabled Send Quote Button */}
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl bg-neutral-200 text-neutral-400 font-sans font-bold text-xs sm:text-sm cursor-not-allowed text-center transition-all"
                >
                  Send Quote
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onSendQuote || (() => toast.success("Opening quote submission form..."))}
                className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs cursor-pointer text-center transition-all"
              >
                Send Quote
              </button>
            )}

            {/* Secondary Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onAskQuestion || (() => toast("Opening message composer with Daniel C..."))}
                className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Ask Question
              </button>
              <button
                type="button"
                onClick={() => {
                  toast("Job offer declined.");
                  onBack();
                }}
                className="w-full py-2 text-neutral-400 hover:text-neutral-700 font-sans font-medium text-xs text-center transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>

          {/* Card 3: Additional questions */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3.5">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Additional questions
            </h3>
            <div className="space-y-3">
              {job.questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-neutral-500 font-medium max-w-[200px]">
                    {q.question}
                  </span>
                  <span className="font-bold text-neutral-900">{q.answer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Area & Distance Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Area
            </h3>

            {/* Simulated Map Visual */}
            <div className="h-28 rounded-2xl bg-neutral-100 border border-neutral-200/80 relative overflow-hidden flex items-center justify-center">
              {/* Subtle Road/Grid Lines */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-0.5 bg-neutral-400 absolute top-8" />
                <div className="w-full h-0.5 bg-neutral-400 absolute top-18" />
                <div className="h-full w-0.5 bg-neutral-400 absolute left-12" />
                <div className="h-full w-0.5 bg-neutral-400 absolute left-28" />
              </div>

              {/* Center Map Pin */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>

            <div className="space-y-0.5 pt-1">
              <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                {job.customerLocation} · {job.distance}
              </p>
              <p className="font-sans text-xs text-neutral-400">
                {job.driveTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

