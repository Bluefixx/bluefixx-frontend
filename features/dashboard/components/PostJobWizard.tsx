"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { SERVICES, CATEGORIES } from "../data/mock-dashboard-data";

export default function PostJobWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId") || "plumbing";
  const { locationName } = useAuth();

  // Wizard Step State (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState("Leak & burst pipe repair");
  const [description, setDescription] = useState(
    "Water is dripping under the kitchen sink since last night. The cabinet floor is already soaked."
  );
  const [urgency, setUrgency] = useState("Emergency, today");
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [preferredTime, setPreferredTime] = useState("Morning (8am - 12pm)");

  // Photos State
  const [photos, setPhotos] = useState<string[]>([
    "/images/customers.png",
    "/images/workers.png",
  ]);

  // Voice Note State
  const [hasVoiceNote, setHasVoiceNote] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const selectedService =
    SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Details" },
    { num: 3, label: "Photos & voice" },
    { num: 4, label: "Budget" },
    { num: 5, label: "Address" },
    { num: 6, label: "Preferred time" },
    { num: 7, label: "Review" },
    { num: 8, label: "Job live" },
  ];

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.success("Job published successfully!");
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  const handleAddPhoto = () => {
    if (photos.length >= 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, "/images/customers.png"]);
    toast.success("Photo added");
  };

  const handleToggleVoicePlayback = () => {
    setIsPlayingVoice((prev) => !prev);
  };

  const handleDeleteVoiceNote = () => {
    setHasVoiceNote(false);
    setIsPlayingVoice(false);
    toast.success("Voice note deleted");
  };

  const handleRecordVoiceNote = () => {
    setIsRecording(true);
    toast("Recording simulated voice note...", { icon: "🎙️" });
    setTimeout(() => {
      setIsRecording(false);
      setHasVoiceNote(true);
      toast.success("Voice note recorded (0:17)");
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto select-none">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
          <Link href="/explore" className="hover:underline">
            Explore
          </Link>
          <span>/</span>
          <span>
            Post a job · {currentStep === 1 ? "Service" : selectedService.name}
          </span>
        </nav>
      </div>

      {/* 8-Step Header Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[680px]">
          {steps.map((step, idx) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <React.Fragment key={step.num}>
                <div
                  onClick={() => {
                    if (step.num <= currentStep) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer ${
                    isCurrent || isCompleted ? "opacity-100" : "opacity-45"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? "bg-[#001B40] text-white shadow-xs"
                        : isCompleted
                        ? "bg-[#001B40] text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {isCompleted ? "✓" : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-sans ${
                      isCurrent
                        ? "font-bold text-[#001B40]"
                        : "text-neutral-500 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.num < currentStep ? "bg-[#001B40]/70" : "bg-neutral-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 1: SERVICE SELECTION (3 on top, 2 on bottom)          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              What do you need help with?
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Choose the service and we will match your job with professionals who do exactly that work.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search services"
              className="w-full bg-white border border-neutral-300 rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] shadow-2xs"
            />
          </div>

          {/* Top Row: 3 Categories (Home & Construction, Repairs & Technical, Automotive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.filter((c) =>
              ["home-construction", "repairs-technical", "automotive"].includes(c.id)
            ).map((cat) => {
              const servicesInCat = SERVICES.filter(
                (s) =>
                  s.categoryId === cat.id &&
                  (!searchFilter.trim() ||
                    s.name.toLowerCase().includes(searchFilter.toLowerCase()))
              );

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        {cat.id === "home-construction" && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
                            <path d="M17.64 15 22 10.64" />
                            <path d="m20.91 3.26-4 4" />
                            <path d="m14.82 4.24 3.9 3.9" />
                            <path d="m11.5 8.5 3-3" />
                          </svg>
                        )}
                        {cat.id === "repairs-technical" && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        )}
                        {cat.id === "automotive" && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="16" height="12" x="4" y="5" rx="2" />
                            <circle cx="8" cy="17" r="2" />
                            <circle cx="16" cy="17" r="2" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                        {cat.name}
                      </h4>
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">
                      {servicesInCat.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {servicesInCat.map((srv) => {
                      const isSelected = selectedServiceId === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#001B40] text-white shadow-xs font-semibold"
                              : "bg-[#F8F9FA] text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          <span>{srv.name}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Row: 2 Categories (Fashion & Beauty, Facility & Property) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORIES.filter((c) =>
              ["fashion-beauty", "facility-property"].includes(c.id)
            ).map((cat) => {
              const servicesInCat = SERVICES.filter(
                (s) =>
                  s.categoryId === cat.id &&
                  (!searchFilter.trim() ||
                    s.name.toLowerCase().includes(searchFilter.toLowerCase()))
              );

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        {cat.id === "fashion-beauty" && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="6" cy="6" r="3" />
                            <circle cx="6" cy="18" r="3" />
                            <line x1="20" y1="4" x2="8.12" y2="15.88" />
                            <line x1="14.47" y1="14.48" x2="20" y2="20" />
                            <line x1="8.12" y1="8.12" x2="12" y2="12" />
                          </svg>
                        )}
                        {cat.id === "facility-property" && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="16" height="20" x="4" y="2" rx="2" />
                            <line x1="9" y1="22" x2="9" y2="18" />
                            <line x1="15" y1="22" x2="15" y2="18" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                        {cat.name}
                      </h4>
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">
                      {servicesInCat.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {servicesInCat.map((srv) => {
                      const isSelected = selectedServiceId === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#001B40] text-white shadow-xs font-semibold"
                              : "bg-[#F8F9FA] text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          <span>{srv.name}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Banner & Sticky Footer */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#001B40] font-bold">
              <div className="w-6 h-6 rounded-full bg-[#001B40] text-white flex items-center justify-center text-xs">
                ✓
              </div>
              <span>
                Selected: {selectedService.categoryName} → {selectedService.name}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer w-fit"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 2: JOB DETAILS                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Tell us about the {selectedService.name.toLowerCase()} job
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              A few details help professionals understand what needs fixing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Form (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
              {/* Task Options */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2.5">
                  What do you need done?*
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Leak & burst pipe repair",
                    "Water heater installation",
                    "Full bathroom re-piping",
                    "Pressure pump servicing",
                    "Others",
                  ].map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedTask === task
                          ? "bg-[#001B40] text-white shadow-xs"
                          : "bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-1.5">
                  Describe the problem*
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Water is dripping under the kitchen sink since last night. The cabinet floor is already soaked."
                  className="w-full bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Be as specific as possible to get accurate quotes.
                </span>
              </div>

              {/* Urgency */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2.5">
                  How urgent is this job?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: "Emergency, today", desc: "Needs immediate fix" },
                    { title: "Within 2-3 days", desc: "Flexible this week" },
                    { title: "Planning ahead", desc: "For next week or later" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      onClick={() => setUrgency(item.title)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        urgency === item.title
                          ? "border-[#001B40] bg-blue-50/50 shadow-2xs"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <span className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-500">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Selected service</span>
                    <span className="font-bold text-neutral-800">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Task</span>
                    <span className="font-semibold text-neutral-800">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Status</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip callout */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-neutral-700">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
                </svg>
                <span>Describe where the problem is, when it started and what you have already tried.</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
            >
              <span>← Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 3: PHOTOS & VOICE NOTE (Faithful Figma Alignment)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Show us what needs fixing
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Add photos or explain the problem in your own words.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Add Photos & Voice Note */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
                {/* 1. Add Photos Section */}
                <div>
                  <h3 className="font-sans font-bold text-base text-[#0F1115] mb-4">
                    Add photos
                  </h3>

                  {/* Photo Cards Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    {photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="relative w-36 sm:w-44 h-28 sm:h-32 rounded-2xl overflow-hidden border border-neutral-200/90 shadow-2xs group bg-neutral-100 shrink-0"
                      >
                        <Image
                          src={photoUrl}
                          alt={`Uploaded photo ${index + 1}`}
                          width={176}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                        {/* Circular Close Button with '✕' */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#001B40]/80 hover:bg-[#001B40] text-white flex items-center justify-center text-xs transition-colors cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add Photo Slot (Dashed Box) */}
                    {photos.length < 5 && (
                      <div
                        onClick={handleAddPhoto}
                        className="w-36 sm:w-44 h-28 sm:h-32 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 hover:bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 transition-all cursor-pointer shrink-0"
                      >
                        <svg
                          className="w-6 h-6 mb-1 text-neutral-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="font-sans font-medium text-xs text-neutral-500">
                          Add
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-xs text-neutral-400 mt-3">
                    Photos help the artisan quote accurately the first time
                  </p>
                </div>

                {/* 2. Voice Note Section */}
                <div className="pt-2">
                  <h3 className="font-sans font-bold text-base text-[#0F1115] mb-3">
                    Voice note
                  </h3>

                  {/* Player Card */}
                  {hasVoiceNote && (
                    <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white flex items-center justify-between gap-3 shadow-2xs mb-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Play/Pause Button */}
                        <button
                          type="button"
                          onClick={handleToggleVoicePlayback}
                          className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        >
                          {isPlayingVoice ? (
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-blue-600 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>

                        {/* Title Label */}
                        <span className="font-sans font-bold text-xs text-[#0F1115] shrink-0">
                          Voice note · 0:17
                        </span>

                        {/* Visual Waveform Audio Bars */}
                        <div className="flex items-center gap-1 flex-1 h-6 overflow-hidden px-2">
                          {[
                            8, 14, 22, 12, 18, 24, 16, 20, 26, 14, 18, 24, 12, 22, 16, 20, 10,
                          ].map((height, i) => (
                            <span
                              key={i}
                              style={{ height: `${height}px` }}
                              className={`w-1 rounded-full transition-all ${
                                isPlayingVoice
                                  ? "bg-blue-600 animate-pulse"
                                  : "bg-blue-500/70"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Red Delete Button */}
                      <button
                        type="button"
                        onClick={handleDeleteVoiceNote}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Hold to Record Button */}
                  <button
                    type="button"
                    onClick={handleRecordVoiceNote}
                    disabled={isRecording}
                    className="w-full py-3.5 px-4 rounded-2xl border border-neutral-300 hover:border-neutral-400 bg-white font-sans font-bold text-xs sm:text-sm text-[#0F1115] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-2xs hover:bg-neutral-50"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                    <span>{isRecording ? "Recording..." : "Hold to record"}</span>
                  </button>

                  <p className="font-sans text-xs text-neutral-400 mt-2">
                    Easier than typing, explain in your own words
                  </p>
                </div>
              </div>

              {/* Step 3 Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>

            {/* Right Column: Job Summary & Camera Tip */}
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">
                    {selectedService.categoryName}
                  </p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg
                  className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="leading-relaxed">
                  Photos help the artisan quote accurately the first time. Include a close-up and a wider view of the affected area.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEPS 4–8: REST OF THE FLOW                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
              What is your estimated budget?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Setting an expected budget range attracts professionals with matching rates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-neutral-700 mb-1 block">Minimum (₦)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-xl p-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700 mb-1 block">Maximum (₦)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-xl p-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button onClick={handleBack} className="text-xs sm:text-sm font-semibold text-neutral-700">← Back</button>
            <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-[#001B40] text-white text-xs sm:text-sm font-semibold">Continue →</button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
              Confirm job address
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Your exact address is protected and only disclosed to the artisan after you confirm the booking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F1115]">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{locationName || "Independence Layout, Enugu"}</span>
            </div>
            <p className="text-xs text-neutral-500 pl-6">14 Ziks Avenue, Enugu, Nigeria</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button onClick={handleBack} className="text-xs sm:text-sm font-semibold text-neutral-700">← Back</button>
            <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-[#001B40] text-white text-xs sm:text-sm font-semibold">Continue →</button>
          </div>
        </div>
      )}

      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
              Preferred time of arrival
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Let artisans know when you are available to receive them.
            </p>
          </div>

          <div className="space-y-2 max-w-md">
            {[
              "Morning (8am - 12pm)",
              "Afternoon (12pm - 4pm)",
              "Evening (4pm - 7pm)",
              "Any time today",
            ].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setPreferredTime(slot)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold cursor-pointer ${
                  preferredTime === slot
                    ? "border-[#001B40] bg-blue-50/50 text-[#001B40]"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button onClick={handleBack} className="text-xs sm:text-sm font-semibold text-neutral-700">← Back</button>
            <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-[#001B40] text-white text-xs sm:text-sm font-semibold">Continue →</button>
          </div>
        </div>
      )}

      {currentStep === 7 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
              Review your job post
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Double check the job requirements before publishing to verified artisans.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-3 text-xs sm:text-sm max-w-xl">
            <div className="flex justify-between py-1 border-b border-neutral-200/60">
              <span className="text-neutral-500">Service:</span>
              <span className="font-bold text-[#0F1115]">{selectedService.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/60">
              <span className="text-neutral-500">Task:</span>
              <span className="font-semibold text-[#0F1115]">{selectedTask}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/60">
              <span className="text-neutral-500">Urgency:</span>
              <span className="font-semibold text-rose-700">{urgency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/60">
              <span className="text-neutral-500">Budget Range:</span>
              <span className="font-bold text-[#001B40]">₦{budgetMin.toLocaleString()} - ₦{budgetMax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Location:</span>
              <span className="font-semibold text-[#0F1115]">{locationName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button onClick={handleBack} className="text-xs sm:text-sm font-semibold text-neutral-700">← Back</button>
            <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs">Publish Job Now →</button>
          </div>
        </div>
      )}

      {currentStep === 8 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115]">
            Your job is live!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            Verified {selectedService.name.toLowerCase()} professionals in {locationName} have been notified. You will receive quotes shortly in your Messages.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] text-white text-xs sm:text-sm font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
