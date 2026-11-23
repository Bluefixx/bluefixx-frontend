"use client";

import React, { useState, useEffect } from "react";
import { AdminTradeCategory } from "../types";

interface OpsCreateTradeModalProps {
  trade: AdminTradeCategory | null; // null for create, object for edit
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Partial<AdminTradeCategory>) => void;
}

export function OpsCreateTradeModal({
  trade,
  isOpen,
  onClose,
  onSave,
}: OpsCreateTradeModalProps) {
  const isEdit = Boolean(trade);

  const [tradeName, setTradeName] = useState("");
  const [subcategoriesText, setSubcategoriesText] = useState("");
  const [commissionOverride, setCommissionOverride] = useState("Standard 10%");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([
    "NIN slip",
    "Trade test certificate",
  ]);

  useEffect(() => {
    if (trade) {
      setTradeName(trade.name);
      setSubcategoriesText(trade.subcategories.join("\n"));
      setCommissionOverride(trade.commissionOverride || "Standard 10%");
      setStatus(trade.status);
      setSelectedRequirements(trade.verificationRequirements || ["NIN slip"]);
    } else {
      setTradeName("");
      setSubcategoriesText("");
      setCommissionOverride("Standard 10%");
      setStatus("Active");
      setSelectedRequirements(["NIN slip", "Trade test certificate"]);
    }
  }, [trade, isOpen]);

  if (!isOpen) return null;

  const toggleRequirement = (req: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) return;

    const subcats = subcategoriesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      id: trade ? trade.id : `TRD-${Date.now()}`,
      name: tradeName.trim(),
      subcategories: subcats.length > 0 ? subcats : ["General"],
      commissionOverride,
      status,
      verificationRequirements: selectedRequirements,
      activeWorkers: trade ? trade.activeWorkers : 0,
      jobs30d: trade ? trade.jobs30d : 0,
      demand: trade ? trade.demand : "Medium",
      avgJobValueKobo: trade ? trade.avgJobValueKobo : 5000000,
      jobsPerWorker: trade ? trade.jobsPerWorker : 1.0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#001B40]">
              {isEdit ? `Edit ${trade?.name}` : "Create trade"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Trades control matching, required verification documents and commission overrides.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Trade Name */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Trade name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              placeholder="e.g. Tiling or Solar installation"
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Subcategories Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-neutral-700">Subcategories</label>
              <span className="text-[10px] text-neutral-400">One per line</span>
            </div>
            <textarea
              rows={4}
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              placeholder="Wall tiling&#10;Floor screeding&#10;Interlock paving"
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Commission Override & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Commission override</label>
              <select
                value={commissionOverride}
                onChange={(e) => setCommissionOverride(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="Standard 10%">Standard 10%</option>
                <option value="8% Promotional">8% Promotional</option>
                <option value="7% High Value">7% High Value</option>
                <option value="5% Volume Partner">5% Volume Partner</option>
                <option value="12% High Risk">12% High Risk</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Verification Requirements Checkboxes */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-neutral-700">Verification requirements</label>
              <span className="text-[10px] text-neutral-400">Required before worker can be verified</span>
            </div>
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
              {[
                "NIN slip",
                "Trade test certificate",
                "Guarantor form",
                "Police clearance report",
                "Workshop photo proof",
                "Electrical licence",
              ].map((req) => {
                const checked = selectedRequirements.includes(req);
                return (
                  <label key={req} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRequirement(req)}
                      className="rounded text-[#001B40]"
                    />
                    <span className="text-neutral-800 font-medium">{req}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
            >
              {isEdit ? "Save changes" : "Create trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
