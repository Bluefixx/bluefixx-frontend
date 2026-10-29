"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface TalentTrainingProgressViewProps {
  onBack: () => void;
  onOpenMessages?: () => void;
  onCompleteProgramme?: () => void;
}

export function TalentTrainingProgressView({
  onBack,
  onOpenMessages,
  onCompleteProgramme,
}: TalentTrainingProgressViewProps) {
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  const timelineSteps = [
    { title: "Orientation", status: "completed" },
    { title: "Workshop Safety", status: "completed" },
    { title: "Basic Tools", status: "completed" },
    { title: "Welding Fundamentals", status: "completed" },
    { title: "Advanced Welding", status: "current", tag: "Advanced Welding" },
    { title: "Final Practical", status: "upcoming" },
    { title: "Completion", status: "upcoming" },
  ];

  const assignments = [
    {
      id: "as-1",
      title: "Practice butt joint, 5 samples",
      badge: "Due tomorrow",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Submit 5 clean welded butt-joint samples for inspection.",
    },
    {
      id: "as-2",
      title: "Workshop safety written test",
      badge: "Submitted",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Standard workshop emergency procedure assessment.",
    },
    {
      id: "as-3",
      title: "Measure & cut exercise sheet",
      badge: "Reviewed",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Accurate metric measurements on steel bars.",
    },
  ];

  const documents = [
    { name: "Programme syllabus.pdf", size: "1.2 MB" },
    { name: "Workshop safety rules.pdf", size: "840 KB" },
    { name: "Payment receipt.pdf", size: "320 KB" },
  ];

  const handleDownloadDoc = (docName: string) => {
    setDownloadingDoc(docName);
    setTimeout(() => {
      setDownloadingDoc(null);
      toast.success(`Downloaded ${docName}`, { icon: "📄" });
    }, 800);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Progress</span>
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          My apprenticeship
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Welding & Metal Fabrication Apprenticeship
        </p>
      </div>

      {/* Main Mentor & Overall Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Mentor Profile Info */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-neutral-100 shrink-0">
              <Image
                src="/images/david.jpg"
                alt="John Obiora"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
                  John Obiora
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Mentor
                </span>
              </div>
              <p className="font-sans text-xs text-neutral-400 mt-0.5">
                Master artisan · Emene Industrial Layout, Enugu
              </p>
            </div>
          </div>

          {/* Action & Stats Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-50 px-3.5 py-2 rounded-2xl border border-neutral-100 text-center min-w-[72px]">
                <span className="font-sans font-bold text-base text-[#001B40] block">
                  92%
                </span>
                <span className="font-sans text-[10px] text-neutral-400 font-medium">
                  Attendance
                </span>
              </div>

              <div className="bg-neutral-50 px-3.5 py-2 rounded-2xl border border-neutral-100 text-center min-w-[72px]">
                <span className="font-sans font-bold text-base text-[#001B40] block">
                  48
                </span>
                <span className="font-sans text-[10px] text-neutral-400 font-medium">
                  Hours
                </span>
              </div>

              <div className="bg-neutral-50 px-3.5 py-2 rounded-2xl border border-neutral-100 text-center min-w-[72px]">
                <span className="font-sans font-bold text-base text-[#001B40] block">
                  2/3
                </span>
                <span className="font-sans text-[10px] text-neutral-400 font-medium">
                  Fee
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenMessages || (() => toast.success("Opening chat with John Obiora"))}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
            >
              Message
            </button>
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="mt-6 pt-5 border-t border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#0F1115]">78% complete</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Advanced Welding
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
            <div className="bg-[#001B40] h-full rounded-full transition-all duration-500 w-[78%]" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Training Timeline + Assignments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Training Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                Training timeline
              </h2>
              {onCompleteProgramme && (
                <button
                  type="button"
                  onClick={onCompleteProgramme}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Simulate Completion 🎓
                </button>
              )}
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              {timelineSteps.map((step, idx) => {
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={idx} className="relative flex items-center justify-between gap-4">
                    {/* Step Icon Bullet */}
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-[#001B40] text-white ring-blue-100"
                          : "bg-neutral-200 text-neutral-400"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-sans text-xs sm:text-sm ${
                          isCompleted
                            ? "font-semibold text-neutral-800"
                            : isCurrent
                            ? "font-bold text-[#001B40]"
                            : "font-medium text-neutral-400"
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.tag && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {step.tag}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-neutral-400">
                      {isCompleted ? "Completed" : isCurrent ? "In progress" : "Upcoming"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Assignments
            </h2>

            <div className="space-y-3">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        {item.title}
                      </h4>
                      <p className="font-sans text-xs text-neutral-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border self-start sm:self-center shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Next session, Fee card, Documents */}
        <div className="lg:col-span-4 space-y-6">
          {/* Next Session Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">
              NEXT SESSION
            </span>
            <p className="font-sans font-bold text-sm text-[#0F1115] leading-snug">
              Thursday 28 August · 2:00pm · Emene workshop
            </p>
          </div>

          {/* Training Fee Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">
              PAYMENT
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Training fee</span>
                <span className="font-bold text-[#0F1115]">₦150,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Paid</span>
                <span className="font-bold text-emerald-600">₦100,000</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.success("Generating payment receipt PDF...", { icon: "🧾" })}
              className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs transition-colors cursor-pointer"
            >
              View receipt
            </button>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">
              DOCUMENTS
            </span>

            <div className="space-y-2.5">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <svg className="w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="font-sans text-xs font-medium text-neutral-800 truncate">
                      {doc.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(doc.name)}
                    disabled={downloadingDoc === doc.name}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-2 cursor-pointer"
                  >
                    {downloadingDoc === doc.name ? "..." : "PDF"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
