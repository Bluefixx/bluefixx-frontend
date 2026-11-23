"use client";

import React, { useState, useEffect } from "react";
import { AdminTradeCategory, AdminTradeSubcategory } from "../types";

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
  const [subcategories, setSubcategories] = useState<AdminTradeSubcategory[]>([]);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [commissionOverride, setCommissionOverride] = useState("Standard 10%");
  const [warrantyDays, setWarrantyDays] = useState<number>(14);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([
    "NIN slip",
    "Trade test certificate",
  ]);

  useEffect(() => {
    if (trade) {
      setTradeName(trade.name);
      if (trade.subcategoryDetails && trade.subcategoryDetails.length > 0) {
        setSubcategories(trade.subcategoryDetails);
      } else {
        setSubcategories(
          trade.subcategories.map((name, idx) => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            rank: idx + 1,
          }))
        );
      }
      setCommissionOverride(trade.commissionOverride || "Standard 10%");
      setWarrantyDays(trade.warrantyDays || 14);
      setStatus(trade.status);
      setSelectedRequirements(trade.verificationRequirements || ["NIN slip"]);
    } else {
      setTradeName("");
      setSubcategories([
        { name: "General Installation", slug: "general-installation", rank: 1 },
        { name: "Diagnostics & Repairs", slug: "diagnostics-repairs", rank: 2 },
      ]);
      setCommissionOverride("Standard 10%");
      setWarrantyDays(14);
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

  const handleAddSubcat = () => {
    if (!newSubcatName.trim()) return;
    const name = newSubcatName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSubcategories((prev) => [
      ...prev,
      { name, slug, rank: prev.length + 1 },
    ]);
    setNewSubcatName("");
  };

  const handleMoveSubcat = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= subcategories.length) return;
    const updated = [...subcategories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // update rank order
    setSubcategories(updated.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const handleRemoveSubcat = (index: number) => {
    const filtered = subcategories.filter((_, i) => i !== index);
    setSubcategories(filtered.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const handleUpdateSlug = (index: number, slug: string) => {
    const updated = [...subcategories];
    updated[index].slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubcategories(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) return;

    const subcategoryNames = subcategories.length > 0
      ? subcategories.map((s) => s.name)
      : ["General"];

    onSave({
      id: trade ? trade.id : `TRD-${Date.now()}`,
      name: tradeName.trim(),
      subcategories: subcategoryNames,
      subcategoryDetails: subcategories,
      warrantyDays,
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
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#001B40]">
              {isEdit ? `Edit ${trade?.name}` : "Create trade"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure matching hierarchy, public catalog slugs, escrow warranty windows, and requirements.
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

          {/* Subcategory Re-ordering & Public Slug Management */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-800 text-xs">Subcategories & Public Search Slugs</span>
                <p className="text-[11px] text-neutral-500">
                  Re-order rank controls which subcategories show first in the customer search dropdown.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-neutral-400 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                {subcategories.length} subcategories
              </span>
            </div>

            {/* Subcategory List with Reordering */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {subcategories.map((sc, idx) => (
                <div
                  key={`${sc.name}-${idx}`}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200 text-xs shadow-2xs"
                >
                  <span className="w-5 text-[10px] font-bold text-neutral-400 text-center">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-800 truncate">{sc.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <span>slug:</span>
                      <input
                        type="text"
                        value={sc.slug}
                        onChange={(e) => handleUpdateSlug(idx, e.target.value)}
                        className="bg-neutral-50 px-1 py-0.5 rounded text-[10px] font-mono border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#001B40] max-w-[130px]"
                      />
                    </div>
                  </div>
                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSubcat(idx, "up")}
                      className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                      title="Move up in catalog"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === subcategories.length - 1}
                      onClick={() => handleMoveSubcat(idx, "down")}
                      className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                      title="Move down in catalog"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcat(idx)}
                      className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer ml-1"
                      title="Remove subcategory"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Subcategory Inline */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubcat();
                  }
                }}
                placeholder="Add new subcategory..."
                className="flex-1 p-2 rounded-lg border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
              />
              <button
                type="button"
                onClick={handleAddSubcat}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg border border-neutral-300 text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Trade Warranty & Coverage Timers */}
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <label className="block font-bold text-neutral-800">
                  Trade Defect Warranty & Escrow Sign-off Window
                </label>
                <p className="text-[11px] text-neutral-500">
                  Standard period after customer delivery before auto-disbursing funds or closing dispute rights.
                </p>
              </div>
              <span className="font-extrabold text-[#001B40] text-sm bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                {warrantyDays} days
              </span>
            </div>
            <select
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
            >
              <option value={3}>3 Days — Minor Repairs, Cleaning, Quick Maintenance</option>
              <option value={7}>7 Days — Plumbing, Basic Mechanical, Locksmith</option>
              <option value={14}>14 Days — Electrical, Painting, Interior Fixtures</option>
              <option value={30}>30 Days — Structural Carpentry, Masonry, Welding</option>
              <option value={60}>60 Days — Solar Inverters, Generator Overhauls</option>
              <option value={90}>90 Days — Commercial Installations & Civil Works</option>
            </select>
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
