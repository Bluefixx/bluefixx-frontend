"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { submitArtisanOfferApi, createJobConversationApi } from "@/lib/api/artisan";
import { nairaToKobo } from "@/lib/utils/currency";

interface ArtisanQuoteFormViewProps {
  jobId?: string;
  quoteId?: string;
  jobTitle?: string;
  customerName?: string;
  customerBudget?: string;
  onBack: () => void;
  onQuoteSent: () => void;
}

export function ArtisanQuoteFormView({
  jobId,
  quoteId,
  jobTitle = "Kitchen Plumbing Repair",
  customerName = "Daniel C.",
  customerBudget = "₦25,000 - ₦50,000",
  onBack,
  onQuoteSent,
}: ArtisanQuoteFormViewProps) {
  const [labour, setLabour] = useState("30,000");
  const [materials, setMaterials] = useState("15,000");
  const [completionTime, setCompletionTime] = useState("2 days");
  const [warranty, setWarranty] = useState("21 days");
  const [workDescription, setWorkDescription] = useState(
    "Shut off the supply, replace the corroded section of pipe under the sink with new PVC, reseal both joints and pressure test. I'll also check the cabinet base for water damage."
  );
  const [materialsIncluded, setMaterialsIncluded] = useState("");
  const [materialsNotIncluded, setMaterialsNotIncluded] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Calculate live totals
  const numLabour = parseInt(labour.replace(/\D/g, ""), 10) || 0;
  const numMaterials = parseInt(materials.replace(/\D/g, ""), 10) || 0;
  const quoteTotal = numLabour + numMaterials;
  const serviceFee = Math.round(quoteTotal * 0.07);
  const netEarnings = quoteTotal - serviceFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      toast.error("Please provide a work description for the customer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const visitStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const visitEnd = new Date(now.getTime() + 27 * 60 * 60 * 1000).toISOString();

      let resolvedQuoteId = quoteId;
      if (!resolvedQuoteId && jobId) {
        const conv = await createJobConversationApi(jobId);
        resolvedQuoteId = conv.quoteId;
      }
      if (!resolvedQuoteId) {
        throw new Error("Missing job or quote reference");
      }

      await submitArtisanOfferApi(resolvedQuoteId, {
        labour: nairaToKobo(numLabour),
        materials: numMaterials > 0 ? [{ name: "Materials", amount: nairaToKobo(numMaterials), supplier: "ARTISAN" }] : [],
        warrantyDays: 21,
        durationDays: 2,
        scope: workDescription,
        exclusions: materialsNotIncluded,
        notes: additionalNotes,
        visitStart,
        visitEnd,
      });
      toast.success("Quote sent successfully to customer!");
      onQuoteSent();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{jobTitle}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Send Quote
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          {jobTitle}
        </p>
      </div>

      {/* Customer Budget Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Customer budget</span>
          <span className="font-heading font-bold text-sm sm:text-base text-[#001B40]">
            {customerBudget}
          </span>
        </div>
        <p className="text-xs text-neutral-400 font-medium">
          A guide only; quote what the work is genuinely worth.
        </p>
      </div>

      {/* 2-Column Form & Quote Summary Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Form Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          {/* Row 1: Labour & Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F1115] mb-2">
                Labour
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  ₦
                </span>
                <input
                  type="text"
                  value={labour}
                  onChange={(e) => setLabour(e.target.value)}
                  placeholder="30,000"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F1115] mb-2">
                Materials
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  ₦
                </span>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="15,000"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Estimated completion */}
          <div>
            <label className="block text-xs font-bold text-[#0F1115] mb-2.5">
              Estimated completion
            </label>
            <div className="flex flex-wrap gap-2">
              {["Same day", "1 day", "2 days", "3 days", "1 week"].map((pill) => {
                const isSelected = completionTime === pill;
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setCompletionTime(pill)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Warranty (minimum 7 days) */}
          <div>
            <label className="block text-xs font-bold text-[#0F1115] mb-2.5">
              Warranty (minimum 7 days)
            </label>
            <div className="flex flex-wrap gap-2">
              {["7 days", "14 days", "21 days", "60 days", "90 days"].map((w) => {
                const isSelected = warranty === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWarranty(w)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Work description (required) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0F1115]">
                Work description
              </label>
              <span className="text-[11px] text-neutral-400 font-medium">required</span>
            </div>
            <textarea
              rows={4}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all resize-none"
            />
          </div>

          {/* Row 5: Materials included (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0F1115]">
                Materials included
              </label>
              <span className="text-[11px] text-neutral-400 font-medium">optional</span>
            </div>
            <input
              type="text"
              value={materialsIncluded}
              onChange={(e) => setMaterialsIncluded(e.target.value)}
              placeholder="List the materials covered by your price."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
            />
          </div>

          {/* Row 6: Materials not included (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0F1115]">
                Materials not included
              </label>
              <span className="text-[11px] text-neutral-400 font-medium">optional</span>
            </div>
            <input
              type="text"
              value={materialsNotIncluded}
              onChange={(e) => setMaterialsNotIncluded(e.target.value)}
              placeholder="Anything the customer would need to buy separately."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
            />
          </div>

          {/* Row 7: Additional notes (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0F1115]">
                Additional notes
              </label>
              <span className="text-[11px] text-neutral-400 font-medium">optional</span>
            </div>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Access needs, timing constraints, anything else."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
            />
          </div>
        </div>

        {/* Right Sticky Card: Your Quote */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
            <h3 className="font-heading font-extrabold text-base text-[#001B40]">
              Your quote
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Labour</span>
                <span className="font-bold text-[#0F1115]">₦{labour || "0"}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Materials</span>
                <span className="font-bold text-[#0F1115]">₦{materials || "0"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-neutral-700">Quote total</span>
              <span className="font-heading font-extrabold text-lg sm:text-xl text-[#001B40]">
                ₦{quoteTotal.toLocaleString()}
              </span>
            </div>

            {/* Blue Fee Calculation Box */}
            <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] text-xs text-[#001B40] leading-relaxed">
              BlueFixx deducts a 7% service fee (₦{serviceFee.toLocaleString()}) when the job is completed, so you receive ₦{netEarnings.toLocaleString()} before ₦0 insurance.
            </div>

            {/* Send Quote Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              Send Quote
            </button>
          </div>
        </div>
      </form>

      {/* Bottom Advice Banner */}
      <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Quotes that explain the work clearly are accepted about 40% more often than price-only quotes.
        </p>
      </div>
    </div>
  );
}

