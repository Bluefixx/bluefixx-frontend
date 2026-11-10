"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { updateAccountProfileApi } from "@/lib/api/account";

interface TalentEditProfileViewProps {
  onBack: () => void;
  onSaveSuccess: () => void;
  initialData?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    avatarUrl?: string;
  };
}

export function TalentEditProfileView({
  onBack,
  onSaveSuccess,
  initialData,
}: TalentEditProfileViewProps) {
  const { user, setUser } = useAuth();

  const nameParts = (user?.fullName || "").trim().split(" ");
  const userFirst = nameParts[0] || "";
  const userLast = nameParts.slice(1).join(" ") || "";

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || userFirst || "",
    lastName: initialData?.lastName || userLast || "",
    phone: initialData?.phone || user?.phone || "",
    email: initialData?.email || user?.email || "",
    address: initialData?.address || "",
    emergencyContact: initialData?.emergencyContact || "",
    avatarUrl: initialData?.avatarUrl || user?.avatarUrl,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      await updatePersonalDetailsApi({
        fullName: updatedFullName,
      });
      if (user) {
        setUser({
          ...user,
          fullName: updatedFullName,
          email: formData.email,
          phone: formData.phone,
        });
      }
      toast.success("Personal details updated successfully!");
      onSaveSuccess();
    } catch {
      toast.error("Failed to update personal details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Profile</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Personal details
        </h1>
      </div>

      {/* Form Container Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
        {/* Profile Photo Uploader Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-neutral-50/60 border border-neutral-200/60">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-heading font-extrabold text-2xl shrink-0 border-2 border-white shadow-xs">
            {formData.avatarUrl ? (
              <Image
                src={formData.avatarUrl}
                alt={formData.firstName || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <span>{(formData.firstName || user?.fullName || "L").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <h4 className="font-heading font-bold text-sm text-[#0F1115]">
              Profile photo
            </h4>
            <p className="font-sans text-xs text-neutral-500 max-w-md leading-relaxed">
              A clear, clean photo works best. Verified artisans and talents with a photo get 3x more apprenticeships and jobs.
            </p>
            <div className="pt-1">
              <label className="inline-block px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs transition-colors cursor-pointer">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => toast.success("Photo uploaded!")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Name Fields (2 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-sans font-bold text-xs text-[#0F1115] block">
              First name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans font-bold text-xs text-[#0F1115] block">
              Last name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* Phone number */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs text-[#0F1115] block">
            Phone number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Email address */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs text-[#0F1115] block">
            Email address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs text-[#0F1115] block">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Emergency contact */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs text-[#0F1115] block">
            Emergency contact
          </label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#001B40] focus:outline-hidden transition-colors"
          />
          <p className="font-sans text-[11px] text-neutral-400">
            Used for emergency safety reporting and on-site incidents.
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
