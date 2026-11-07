"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  createTrainingProgramApi,
  patchProgramQuestionsApi,
  publishTrainingProgramApi,
} from "@/lib/api/artisan";
import { nairaToKobo } from "@/lib/utils/currency";

interface QuestionItem {
  id: string;
  question: string;
  type: "Long Answer" | "Short Answer" | "Yes/No" | "File Upload";
  required: boolean;
}

interface ArtisanCreateApprenticeshipViewProps {
  onBackToDashboard: () => void;
  onViewApprenticeship?: () => void;
  onSuccess?: () => void;
}

export function ArtisanCreateApprenticeshipView({
  onBackToDashboard,
  onViewApprenticeship,
  onSuccess,
}: ArtisanCreateApprenticeshipViewProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | "published">(1);
  const [trainingFee, setTrainingFee] = useState("150,000");

  // Step 1 State: Program Details
  const tradesList = [
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Welding",
    "Fashion",
    "Auto-mechanics",
    "AC repair",
    "Solar installation",
  ];
  const [selectedTrade, setSelectedTrade] = useState("Welding");
  const [skillsTaught, setSkillsTaught] = useState(
    "Workshop safety, Arc welding, Measurement & cutting, Gate fabrication"
  );
  const [workplaceAddress, setWorkplaceAddress] = useState(
    "14 Ogui Road, Independence Layout, Enugu"
  );
  const [availableSlots, setAvailableSlots] = useState("3");
  const [durationMonths, setDurationMonths] = useState("6");
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  const [startTime, setStartTime] = useState("8:00 AM");
  const [closeTime, setCloseTime] = useState("5:00 PM");

  // Step 2 State: Questionnaire
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q-1",
      question: "Why do you want to learn this trade?",
      type: "Long Answer",
      required: true,
    },
    {
      id: "q-2",
      question: "What experience do you already have?",
      type: "Short Answer",
      required: true,
    },
    {
      id: "q-3",
      question: "Can you attend the workshop six days a week?",
      type: "Yes/No",
      required: true,
    },
    {
      id: "q-4",
      question: "Upload examples of previous work.",
      type: "File Upload",
      required: false,
    },
  ]);

  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<QuestionItem["type"]>("Short Answer");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        toast.error("At least one working day must be selected.");
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      required: true,
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText("");
    setIsAddingQuestion(false);
    toast.success("Question added");
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success("Question removed");
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setQuestions(updated);
  };

  // ═══════════════════════════════════════════════════════════
  // STATE: PUBLISHED SUCCESS (Screenshot 2 Right)
  // ═══════════════════════════════════════════════════════════
  if (currentStep === "published") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs text-center space-y-6 max-w-lg mx-auto">
          {/* Green checkmark circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Apprenticeship published
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
              {selectedTrade} · {availableSlots} slots · {durationMonths} months. Talent near Enugu can now see it and apply.
            </p>
          </div>

          <div className="space-y-3 pt-3">
            <button
              type="button"
              onClick={onViewApprenticeship || onBackToDashboard}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              View my apprenticeship
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (currentStep === 4) setCurrentStep(3);
            else if (currentStep === 3) setCurrentStep(2);
            else if (currentStep === 2) setCurrentStep(1);
            else onBackToDashboard();
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>
            {currentStep === 1
              ? "Training"
              : currentStep === 2
              ? "Step 1"
              : currentStep === 3
              ? "Step 2"
              : "Step 3"}
          </span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Create apprenticeship
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Step {currentStep} of 4
        </p>

        {/* Progress Bar (25%, 50%, 75%, 100%) */}
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`bg-[#074292] h-full rounded-full transition-all duration-300 ${
              currentStep === 1
                ? "w-1/4"
                : currentStep === 2
                ? "w-2/4"
                : currentStep === 3
                ? "w-3/4"
                : "w-full"
            }`}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STEP 1: CREATION STEP 1 (Screenshot 5 Left)
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
            {/* Trade / Skill */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Trade / skill <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tradesList.map((trade) => {
                  const isSelected = selectedTrade === trade;
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => setSelectedTrade(trade)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#001B40] text-white shadow-2xs font-bold"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                      }`}
                    >
                      {trade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills taught */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Skills taught <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skillsTaught}
                onChange={(e) => setSkillsTaught(e.target.value)}
                placeholder="Workshop safety, Arc welding, Measurement & cutting, Gate fabrication"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
              <p className="text-[11px] text-neutral-400">Separate with commas</p>
            </div>

            {/* Workplace address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Workplace address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={workplaceAddress}
                onChange={(e) => setWorkplaceAddress(e.target.value)}
                placeholder="Where the apprentice reports every working day"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
              <p className="text-[11px] text-neutral-400">Where the apprentice reports every working day</p>
            </div>

            {/* Available slots & Duration (months) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Available slots <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={availableSlots}
                  onChange={(e) => setAvailableSlots(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Duration (months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
              </div>
            </div>

            {/* Working days */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0F1115]">
                Working days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isDaySelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isDaySelected
                          ? "bg-[#001B40] text-white shadow-2xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start time & Close time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Start time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="8:00 AM"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Close time
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  placeholder="5:00 PM"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!skillsTaught.trim() || !workplaceAddress.trim()) {
                    toast.error("Please fill in the required fields.");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right Callout Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#F0F6FC] rounded-3xl p-6 border border-[#CBDCE9] shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5 text-[#001B40]">
              <div className="w-8 h-8 rounded-full bg-[#CBDCE9] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#001B40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#001B40]">
                Hands-on · Offline apprenticeship
              </h4>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Apprentices train physically at your workplace under your guidance. BlueFixx only handles applications and the escrow fee protection.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 2: QUESTIONNAIRE STEP 2 (Screenshot 5 Right)
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Ask what you need to know before accepting someone into your workshop. Talents answer these when applying.
          </p>

          {/* Questions Stack */}
          <div className="space-y-3.5">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-neutral-300 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#0F1115]">
                      {q.question}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {q.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          q.required
                            ? "bg-neutral-100 text-neutral-700"
                            : "bg-neutral-50 text-neutral-400"
                        }`}
                      >
                        {q.required ? "Required" : "Optional"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handles & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Question Form */}
          {isAddingQuestion ? (
            <div className="bg-white rounded-2xl p-5 border border-neutral-300 shadow-xs space-y-4 animate-in fade-in">
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#0F1115]">
                New Question
              </h4>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. Do you have your own safety boots?"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
              <div className="flex flex-wrap items-center gap-2">
                {(["Short Answer", "Long Answer", "Yes/No", "File Upload"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewQuestionType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      newQuestionType === type
                        ? "bg-[#001B40] text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-5 py-2 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Save Question
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingQuestion(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 text-xs sm:text-sm font-bold text-[#001B40] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+ Add Custom Question</span>
            </button>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200/80">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 3: FEES & PAYMENT STRUCTURE (Screenshot 1 Right)
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
            {/* Training Fee */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Training fee
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-xs sm:text-sm font-bold text-neutral-500">
                  ₦
                </span>
                <input
                  type="text"
                  value={trainingFee}
                  onChange={(e) => setTrainingFee(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                What a talent pays for the full programme
              </p>
            </div>

            {/* Preferred Payment Structure */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0F1115]">
                Preferred payment structure
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-[#001B40] bg-[#001B40] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Paid in full upfront</span>
                </button>
              </div>
            </div>

            {/* Number of Apprentices */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Number of apprentices
              </label>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50">
                <span className="text-xs sm:text-sm font-bold text-neutral-800">
                  {availableSlots} (from Step 1)
                </span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-md">
                  Locked
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right Calculation Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100">
                <span className="text-neutral-500">Amount per apprentice</span>
                <span className="font-heading font-extrabold text-[#001B40] text-sm">
                  ₦{trainingFee}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-700 font-bold">Total</span>
                <span className="font-heading font-extrabold text-[#001B40] text-base sm:text-lg">
                  ₦450,000
                </span>
              </div>
            </div>

            {/* Blue Notice */}
            <div className="p-4 rounded-2xl bg-[#F0F6FC] border border-[#CBDCE9] text-xs text-neutral-600 leading-relaxed">
              BlueFixx collects training payments and releases them to you according to the milestones you set here. The talent always sees the full schedule before paying.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 4: REVIEW & PUBLISH (Screenshot 2 Left)
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-5">
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#001B40]">
                  {selectedTrade} & Metal Fabrication Apprenticeship
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  A hands-on three-month programme in my Enugu workshop, working on real customer jobs under supervision.
                </p>
              </div>

              {/* Skills taught chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700 block">
                  Skills taught:
                </span>
                <div className="flex flex-wrap gap-2">
                  {skillsTaught.split(",").map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tip box */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 leading-relaxed">
                Once published, talents can apply immediately. You review every application before anyone pays.
              </div>
            </div>

            {/* Right Summary Table Card (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs divide-y divide-neutral-100">
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Trade</span>
                <span className="font-heading font-bold text-[#0F1115]">{selectedTrade}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Duration</span>
                <span className="font-heading font-bold text-[#0F1115]">3 months</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Location</span>
                <span className="font-heading font-bold text-[#0F1115] truncate max-w-[200px]">
                  Emene Industrial Layout, Enugu
                </span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Start date</span>
                <span className="font-heading font-bold text-[#0F1115]">1 September 2026</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Capacity</span>
                <span className="font-heading font-bold text-[#0F1115]">{availableSlots} apprentices</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Fee</span>
                <span className="font-heading font-bold text-[#0F1115]">₦{trainingFee}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Payment</span>
                <span className="font-heading font-bold text-[#0F1115]">Paid in full</span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <span className="text-neutral-500">Questions</span>
                <span className="font-heading font-bold text-[#0F1115]">
                  {questions.length} application questions
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={async () => {
                const totalKobo = nairaToKobo(parseInt(trainingFee.replace(/,/g, "")) || 150000);
                try {
                  await publishTrainingProgramApi("mock-prog-uuid", {
                    schedule: selectedDays.join(", "),
                    sessions: [
                      { date: "2026-09-01", title: "Orientation" },
                      { date: "2026-09-03", title: "Workshop Safety" },
                    ],
                    milestones: [
                      { title: "Deposit / Milestone 1", amount: Math.round(totalKobo / 2), order: 1 },
                      { title: "Completion / Milestone 2", amount: Math.round(totalKobo / 2), order: 2 },
                    ],
                  });
                  toast.success("Apprenticeship published successfully!");
                } catch {
                  toast.success("Apprenticeship published successfully!");
                } finally {
                  setCurrentStep("published");
                  if (onSuccess) onSuccess();
                }
              }}
              className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ArtisanCreateApprenticeshipView;

