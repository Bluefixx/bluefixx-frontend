"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { submitTalentApplicationApi } from "@/lib/api/talent";
import { uploadMediaFile } from "@/lib/api/media";
import { TalentCurrentSituation, TalentProgramQuestion } from "@/types/talent";

const isBuiltinQuestion = (prompt: string) => {
  const lower = prompt.toLowerCase();
  return (
    lower.includes("why do you want") ||
    lower.includes("experience") ||
    lower.includes("six days") ||
    lower.includes("six-day") ||
    lower.includes("previous work") ||
    lower.includes("work example")
  );
};

interface TalentApplicationFormViewProps {
  onBack: () => void;
  programId?: string;
  programmeTitle?: string;
  artisanName?: string;
  artisanAvatar?: string;
  duration?: string;
  fee?: string;
  questions?: TalentProgramQuestion[];
  onSubmitSuccess?: () => void;
}

export function TalentApplicationFormView({
  onBack,
  programId = "",
  programmeTitle = "Apprenticeship Programme",
  artisanName = "Verified Master Artisan",
  artisanAvatar,
  duration = "Flexible",
  fee = "₦0",
  questions = [],
  onSubmitSuccess,
}: TalentApplicationFormViewProps) {
  // Form fields state
  const [whyAnswer, setWhyAnswer] = useState("");
  const [experienceAnswer, setExperienceAnswer] = useState("");
  const [attendSixDays, setAttendSixDays] = useState<"Yes" | "No" | null>(null);
  const [situation, setSituation] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedMediaFiles, setUploadedMediaFiles] = useState<File[]>([]);
  const [extraAnswers, setExtraAnswers] = useState<Record<string, string | boolean>>({});
  const [extraFiles, setExtraFiles] = useState<Record<string, File[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const extraQuestions = questions.filter((q) => !isBuiltinQuestion(q.prompt));

  // Validation error flags
  const [errors, setErrors] = useState<{
    why?: string;
    experience?: string;
    attend?: string;
    situation?: string;
    extra?: Record<string, string>;
  }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const situations = [
    "Secondary school leaver",
    "Currently unemployed",
    "Working, changing trade",
    "Student",
  ];

  // Calculate answered count out of required questions
  const requiredExtraQuestions = extraQuestions.filter((q) => q.required);
  const answeredExtraCount = requiredExtraQuestions.filter((q) => {
    if (q.type === "FILE") return (extraFiles[q.id]?.length ?? 0) > 0;
    const val = extraAnswers[q.id];
    if (q.type === "YES_NO") return typeof val === "boolean";
    return typeof val === "string" && val.trim().length > 0;
  }).length;
  const totalRequiredCount = 4 + requiredExtraQuestions.length;
  const answeredCount =
    [
      whyAnswer.trim().length > 0,
      experienceAnswer.trim().length > 0,
      attendSixDays !== null,
      situation.length > 0,
    ].filter(Boolean).length + answeredExtraCount;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        urls.push(URL.createObjectURL(files[i]));
        newFiles.push(files[i]);
      }
      setUploadedPhotos((prev) => [...prev, ...urls]);
      setUploadedMediaFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${files.length} file(s) attached`);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!whyAnswer.trim()) {
      newErrors.why = "This answer is required";
    }
    if (!experienceAnswer.trim()) {
      newErrors.experience = "This answer is required";
    }
    if (attendSixDays === null) {
      newErrors.attend = "Please select Yes or No";
    }
    if (!situation) {
      newErrors.situation = "Please select your current situation";
    }

    const extraErrs: Record<string, string> = {};
    for (const q of requiredExtraQuestions) {
      if (q.type === "FILE") {
        if ((extraFiles[q.id]?.length ?? 0) === 0) {
          extraErrs[q.id] = "Please attach at least one file";
        }
      } else if (q.type === "YES_NO") {
        if (typeof extraAnswers[q.id] !== "boolean") {
          extraErrs[q.id] = "Please select Yes or No";
        }
      } else {
        const val = extraAnswers[q.id];
        if (typeof val !== "string" || !val.trim()) {
          extraErrs[q.id] = "This answer is required";
        }
      }
    }
    if (Object.keys(extraErrs).length > 0) {
      newErrors.extra = extraErrs;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please answer all required questions");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Map UI situation selection to enum
    let currentSituationEnum: TalentCurrentSituation = "OTHER";
    if (situation.includes("Secondary school")) {
      currentSituationEnum = "SECONDARY_SCHOOL";
    } else if (situation.includes("unemployed")) {
      currentSituationEnum = "UNEMPLOYED";
    } else if (situation.includes("changing trade")) {
      currentSituationEnum = "CHANGING_TRADE";
    } else if (situation.includes("Student")) {
      currentSituationEnum = "STUDENT";
    }

    try {
      // Upload any work media files first
      const mediaIds: string[] = [];
      for (const file of uploadedMediaFiles) {
        const res = await uploadMediaFile(file, "PORTFOLIO");
        if (res?.id) mediaIds.push(res.id);
      }

      const answersPayload: Record<string, string | boolean | string[]> = {};
      for (const q of questions) {
        const lower = q.prompt.toLowerCase();
        if (lower.includes("why do you want")) {
          answersPayload[q.id] = whyAnswer.trim();
        } else if (lower.includes("experience")) {
          answersPayload[q.id] = experienceAnswer.trim();
        } else if (lower.includes("six days") || lower.includes("six-day")) {
          answersPayload[q.id] = attendSixDays === "Yes";
        } else if (lower.includes("previous work") || lower.includes("work example")) {
          if (mediaIds.length > 0) answersPayload[q.id] = mediaIds;
        } else if (q.type === "FILE") {
          const filesForQ = extraFiles[q.id] ?? [];
          if (filesForQ.length > 0) {
            const uploadedIds: string[] = [];
            for (const file of filesForQ) {
              const res = await uploadMediaFile(file, "PORTFOLIO");
              if (res?.id) uploadedIds.push(res.id);
            }
            answersPayload[q.id] = uploadedIds;
          }
        } else if (extraAnswers[q.id] !== undefined) {
          const val = extraAnswers[q.id];
          answersPayload[q.id] = typeof val === "string" ? val.trim() : val;
        }
      }

      await submitTalentApplicationApi(programId, {
        motivation: whyAnswer.trim(),
        experience: experienceAnswer.trim(),
        sixDayAvailability: attendSixDays === "Yes",
        currentSituation: currentSituationEnum,
        workMediaIds: mediaIds,
        ...(Object.keys(answersPayload).length > 0 ? { answers: answersPayload } : {}),
      });

      setIsSubmitted(true);
      toast.success("Application submitted to " + artisanName + "!", {
        duration: 4000,
        icon: "🎉",
      });

      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit application. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

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
          <span>Learn from a master artisan</span>
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Apply
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          {programmeTitle}
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): The 5 Questions Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          {/* Progress Tracker Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500">
              {answeredCount} of {totalRequiredCount} required questions answered
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalRequiredCount }, (_, idx) => idx + 1).map((num) => (
                <div
                  key={num}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    answeredCount >= num ? "w-6 bg-[#001B40]" : "w-2 bg-neutral-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question 1 */}
            <div className="space-y-2">
              <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                1. Why do you want to learn this trade? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={whyAnswer}
                onChange={(e) => {
                  setWhyAnswer(e.target.value);
                  if (errors.why) setErrors((prev) => ({ ...prev, why: undefined }));
                }}
                placeholder="Take your time; the master reads every answer."
                className={`w-full p-4 rounded-2xl bg-neutral-50/60 border text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-hidden transition-all resize-none ${
                  errors.why ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#001B40]"
                }`}
              />
              {errors.why && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.why}
                </p>
              )}
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                2. What experience do you already have? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={experienceAnswer}
                onChange={(e) => {
                  setExperienceAnswer(e.target.value);
                  if (errors.experience) setErrors((prev) => ({ ...prev, experience: undefined }));
                }}
                placeholder="e.g. None / Helper at workshop"
                className={`w-full px-4 py-3 rounded-2xl bg-neutral-50/60 border text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-hidden transition-all ${
                  errors.experience ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#001B40]"
                }`}
              />
              {errors.experience && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.experience}
                </p>
              )}
            </div>

            {/* Question 3 */}
            <div className="space-y-2">
              <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                3. Can you attend the workshop six days a week? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                {(["Yes", "No"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setAttendSixDays(opt);
                      if (errors.attend) setErrors((prev) => ({ ...prev, attend: undefined }));
                    }}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      attendSixDays === opt
                        ? "border-[#001B40] bg-[#001B40] text-white shadow-xs"
                        : "border-neutral-200 hover:bg-neutral-50 text-neutral-700 bg-white"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        attendSixDays === opt ? "border-white" : "border-neutral-300"
                      }`}
                    >
                      {attendSixDays === opt && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
              {errors.attend && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.attend}
                </p>
              )}
            </div>

            {/* Question 4 */}
            <div className="space-y-2">
              <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                4. Which best describes your current situation? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {situations.map((sit) => (
                  <div
                    key={sit}
                    onClick={() => {
                      setSituation(sit);
                      if (errors.situation) setErrors((prev) => ({ ...prev, situation: undefined }));
                    }}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                      situation === sit
                        ? "border-[#001B40] bg-blue-50/30 text-[#001B40] font-bold"
                        : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        situation === sit ? "border-[#001B40] bg-[#001B40]" : "border-neutral-300"
                      }`}
                    >
                      {situation === sit && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{sit}</span>
                  </div>
                ))}
              </div>
              {errors.situation && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.situation}
                </p>
              )}
            </div>

            {/* Question 5 (Optional) */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                5. Upload examples of previous work <span className="text-neutral-400 font-normal">(optional)</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl text-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-neutral-50/50"
              >
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload work examples (any file type)</span>
              </button>

              {uploadedPhotos.length > 0 && (
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                  ✓ {uploadedPhotos.length} file(s) selected
                </p>
              )}
            </div>

            {/* Additional Questions from Master Artisan */}
            {extraQuestions.map((q, idx) => {
              const qError = errors.extra?.[q.id];
              const qNumber = 6 + idx;
              return (
                <div key={q.id} className="space-y-2 pt-2 border-t border-neutral-100">
                  <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                    {qNumber}. {q.prompt}{" "}
                    {q.required ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-neutral-400 font-normal">(optional)</span>
                    )}
                  </label>

                  {q.type === "TEXT" && (
                    <textarea
                      rows={2}
                      value={typeof extraAnswers[q.id] === "string" ? (extraAnswers[q.id] as string) : ""}
                      onChange={(e) => {
                        setExtraAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                        if (qError) {
                          setErrors((prev) => ({
                            ...prev,
                            extra: { ...prev.extra, [q.id]: "" },
                          }));
                        }
                      }}
                      placeholder="Write your answer..."
                      className={`w-full p-4 rounded-2xl bg-neutral-50/60 border text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:bg-white focus:outline-hidden transition-all resize-none ${
                        qError ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#001B40]"
                      }`}
                    />
                  )}

                  {q.type === "YES_NO" && (
                    <div className="flex items-center gap-3">
                      {(["Yes", "No"] as const).map((opt) => {
                        const isSelected =
                          (opt === "Yes" && extraAnswers[q.id] === true) ||
                          (opt === "No" && extraAnswers[q.id] === false);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setExtraAnswers((prev) => ({ ...prev, [q.id]: opt === "Yes" }));
                              if (qError) {
                                setErrors((prev) => ({
                                  ...prev,
                                  extra: { ...prev.extra, [q.id]: "" },
                                }));
                              }
                            }}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#001B40] bg-[#001B40] text-white shadow-xs"
                                : "border-neutral-200 hover:bg-neutral-50 text-neutral-700 bg-white"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-white" : "border-neutral-300"
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "FILE" && (
                    <div>
                      <label className="w-full py-4 border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl text-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-neutral-50/50">
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files ? Array.from(e.target.files) : [];
                            if (files.length > 0) {
                              setExtraFiles((prev) => ({
                                ...prev,
                                [q.id]: [...(prev[q.id] ?? []), ...files],
                              }));
                              if (qError) {
                                setErrors((prev) => ({
                                  ...prev,
                                  extra: { ...prev.extra, [q.id]: "" },
                                }));
                              }
                              toast.success(`${files.length} file(s) attached`);
                            }
                            e.target.value = "";
                          }}
                        />
                        <span>Upload files (any file type)</span>
                      </label>
                      {(extraFiles[q.id]?.length ?? 0) > 0 && (
                        <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                          ✓ {extraFiles[q.id].length} file(s) selected
                        </p>
                      )}
                    </div>
                  )}

                  {qError && (
                    <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                      <span>⚠</span> {qError}
                    </p>
                  )}
                </div>
              );
            })}
          </form>
        </div>

        {/* Right Column (4 cols): Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-5 sticky top-24">
            {/* Master Mini Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
                {artisanAvatar ? (
                  <Image
                    src={artisanAvatar}
                    alt={artisanName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{artisanName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  {artisanName}
                </h4>
                <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                  {duration} · {fee}
                </p>
              </div>
            </div>

            {/* Applying As info */}
            <div>
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
                APPLYING AS
              </span>
              <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] mt-1">
                Daniel Eze · +234 803 212 1788
              </p>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Fee if accepted</span>
                <span className="font-bold text-[#0F1115]">{fee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Pay now</span>
                <span className="font-bold text-emerald-600">₦0 (Free)</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="font-sans text-[11px] text-neutral-400 leading-relaxed">
              Applying is free. You will only be asked to pay after the master artisan accepts you.
            </p>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
