"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { SERVICES, CATEGORIES, ServiceItem } from "../data/mock-dashboard-data";

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
  const [photosCount, setPhotosCount] = useState(2);
  const [preferredTime, setPreferredTime] = useState("Morning (8am - 12pm)");

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

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
          <Link href="/dashboard/explore" className="hover:underline">
            Explore
          </Link>
          <span>/</span>
          <span>Post a job - {steps[currentStep - 1].label}</span>
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
                    isCurrent || isCompleted ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? "bg-[#001B40] text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {isCompleted ? "✓" : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-sans ${
                      isCurrent ? "font-bold text-[#001B40]" : "text-neutral-500 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.num < currentStep ? "bg-emerald-500" : "bg-neutral-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 1: SERVICE SELECTION                                  */}
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
          <div className="relative max-w-xl">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
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
              className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
            />
          </div>

          {/* Category Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const servicesInCat = SERVICES.filter(
                (s) =>
                  s.categoryId === cat.id &&
                  (!searchFilter.trim() ||
                    s.name.toLowerCase().includes(searchFilter.toLowerCase()))
              );

              if (servicesInCat.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                      {cat.name}
                    </h4>
                    <span className="text-xs text-neutral-400 font-medium">
                      {servicesInCat.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {servicesInCat.map((srv) => {
                      const isSelected = selectedServiceId === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#001B40] text-white shadow-xs font-semibold"
                              : "text-neutral-700 hover:bg-neutral-50"
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

          {/* Selected Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2.5 text-xs sm:text-sm text-[#001B40] font-semibold">
            <svg className="w-4 h-4 text-blue-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              Selected: {selectedService.categoryName} → {selectedService.name}
            </span>
          </div>

          {/* Footer Navigation */}
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
                  The more detail you give, the more accurate the quote.
                </span>
              </div>

              {/* Urgency */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2.5">
                  How urgent is it?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Emergency, today",
                    "Within 2 days",
                    "This week",
                    "Flexible",
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        urgency === lvl
                          ? "bg-[#001B40] text-white shadow-xs"
                          : "bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Preview Column */}
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
                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
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
      {/* STEPS 3–8: WIZARD PROGRESSION                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
              Upload photos or a voice note
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Photos help the artisan bring the right tools and parts on the first visit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:bg-neutral-50 cursor-pointer">
              <svg className="w-8 h-8 text-neutral-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <p className="font-bold text-xs text-neutral-800">Add up to 5 photos</p>
              <span className="text-[11px] text-neutral-400">PNG, JPG up to 10MB each</span>
              <p className="mt-2 text-xs text-blue-600 font-semibold">{photosCount} photos attached</p>
            </div>

            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:bg-neutral-50 cursor-pointer">
              <svg className="w-8 h-8 text-neutral-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <p className="font-bold text-xs text-neutral-800">Record a 60-second voice note</p>
              <span className="text-[11px] text-neutral-400">Explain in English, Igbo, Hausa, or Pidgin</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button onClick={handleBack} className="text-xs sm:text-sm font-semibold text-neutral-700">← Back</button>
            <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-[#001B40] text-white text-xs sm:text-sm font-semibold">Continue →</button>
          </div>
        </div>
      )}

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
