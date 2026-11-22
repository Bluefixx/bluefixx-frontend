"use client";

import React, { useState } from "react";
import { AdminTalentCertification } from "../types";

interface OpsIssueCertificationModalProps {
  certification: AdminTalentCertification | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (certId: string) => void;
}

export function OpsIssueCertificationModal({
  certification,
  isOpen,
  onClose,
  onConfirm,
}: OpsIssueCertificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !certification) return null;

  const handleIssue = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(certification.id);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            Issue certification to {certification.talentName}?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Warning / Details Notice Box */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="text-blue-600 text-base mt-0.5">ⓘ</span>
            <div className="text-xs text-blue-950 font-medium space-y-1.5 leading-relaxed">
              <p className="font-bold text-blue-950">
                You are about to issue a formal BlueFixx apprenticeship certification to {certification.talentName}:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-blue-900">
                <li>This certificate is permanently verifiable on their public profile.</li>
                <li>Talent becomes eligible to convert to a full worker account.</li>
                <li>Master artisan verification record is locked and archived.</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 italic">
          This action is recorded in the activity log with your admin account credentials.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleIssue}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#074292] text-white text-xs font-bold hover:bg-[#001B40] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {isSubmitting ? "Issuing..." : "Issue Certification"}
          </button>
        </div>
      </div>
    </div>
  );
}
