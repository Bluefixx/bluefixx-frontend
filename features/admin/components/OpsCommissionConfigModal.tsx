"use client";

import React, { useState } from "react";
import { CommissionTierConfig } from "../types";
import toast from "react-hot-toast";

interface OpsCommissionConfigModalProps {
  currentConfig: CommissionTierConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: CommissionTierConfig) => void;
}

export function OpsCommissionConfigModal({
  currentConfig,
  isOpen,
  onClose,
  onSave,
}: OpsCommissionConfigModalProps) {
  const [config, setConfig] = useState<CommissionTierConfig>(currentConfig);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleOverrideChange = (trade: string, newPercent: number) => {
    setConfig((prev) => ({
      ...prev,
      categoryOverrides: prev.categoryOverrides.map((o) =>
        o.trade === trade ? { ...o, percent: newPercent } : o
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(config);
      setIsSaving(false);
      toast.success("Platform commission tiers updated successfully.");
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#001B40] text-white flex items-center justify-center text-lg font-bold">
              ⚙️
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Commission & Fee Configuration</h3>
              <p className="text-xs text-neutral-500">
                Adjust baseline marketplace take rates and category-specific overrides
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Global Baseline Tiers */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Core Platform Fees
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Standard Marketplace Take Rate (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.standardCommissionPercent}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      standardCommissionPercent: parseFloat(e.target.value) || 10,
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Solar Installation Rate (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.solarCommissionPercent}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      solarCommissionPercent: parseFloat(e.target.value) || 8,
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Apprenticeship Program Fee (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.apprenticeshipCommissionPercent}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      apprenticeshipCommissionPercent: parseFloat(e.target.value) || 15,
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Withdrawal Flat Fee (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={config.withdrawalFlatFee}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      withdrawalFlatFee: parseFloat(e.target.value) || 50,
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Trade Category Overrides */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Category Take Rate Overrides
              </label>
              <span className="text-[11px] text-neutral-400">Tuned per trade category</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {config.categoryOverrides.map((item) => (
                <div
                  key={item.trade}
                  className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-neutral-800">{item.trade}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={item.percent}
                      onChange={(e) => handleOverrideChange(item.trade, parseFloat(e.target.value) || 10)}
                      className="w-16 p-1.5 text-center font-bold border border-neutral-300 rounded-lg text-neutral-900"
                    />
                    <span className="text-neutral-500 font-bold">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Commission Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
