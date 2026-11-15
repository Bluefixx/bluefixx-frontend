"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getAccountProfileApi, updateAccountProfileApi, uploadMediaFile } from "@/lib/api";
import { useAuth } from "@/lib/stores/auth-store";
import type { AccountProfile } from "@/types/customer";

/**
 * The backend `GET /account` responds with a nested `{ user, settings, contacts }`
 * envelope while the shared `AccountProfile` type models a flattened shape.
 * This intersection covers both without resorting to `any`.
 */
type AccountEnvelope = Partial<AccountProfile> & {
  user?: {
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  settings?: {
    emergencyName?: string;
    emergencyPhone?: string;
  };
};

interface ArtisanPersonalDetailsViewProps {
  onBackToProfile: () => void;
  onSuccess?: () => void;
}

function normalizeE164Phone(val: string): string {
  let cleaned = val.trim().replace(/[\s\-\(\)]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+234" + cleaned.slice(1);
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export function ArtisanPersonalDetailsView({
  onBackToProfile,
  onSuccess,
}: ArtisanPersonalDetailsViewProps) {
  const { user, setUser } = useAuth();

  const nameParts = (user?.fullName || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.streetAddress || "");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarMediaId, setAvatarMediaId] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const profile = (await getAccountProfileApi()) as AccountEnvelope;
        if (!mounted || !profile) return;
        const profileUser = profile.user ?? profile;
        const settings = profile.settings;

        if (profileUser.fullName) {
          const parts = profileUser.fullName.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (profileUser.phone) setPhoneNumber(profileUser.phone);
        if (profileUser.email) setEmailAddress(profileUser.email);
        if (profileUser.avatarUrl) setAvatarPreview(profileUser.avatarUrl);

        const name = settings?.emergencyName ?? profile.emergencyContact?.name;
        if (name) setEmergencyName(name);
        const emergency = settings?.emergencyPhone ?? profile.emergencyContact?.phone;
        if (emergency) setEmergencyPhone(emergency);
      } catch (err) {
        console.debug("Account profile API unavailable.", err);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const res = await uploadMediaFile(file, "PROFILE");
      if (res?.id) {
        setAvatarMediaId(res.id);
        toast.success("Profile photo uploaded");
      }
    } catch (err) {
      console.debug("Profile photo upload failed.", err);
      toast.error("Could not upload profile photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();

    let sanitizedEmergencyPhone = "";
    if (emergencyPhone.trim()) {
      sanitizedEmergencyPhone = normalizeE164Phone(emergencyPhone);
      if (!/^\+[1-9]\d{7,14}$/.test(sanitizedEmergencyPhone)) {
        toast.error("Emergency phone must be in international format (e.g. +2348012345678)");
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateAccountProfileApi({
        fullName: combinedName || undefined,
        photoId: avatarMediaId,
        emergencyName: emergencyName.trim() || undefined,
        emergencyPhone: sanitizedEmergencyPhone || undefined,
      });

      if (user) {
        setUser({
          ...user,
          fullName: combinedName || user.fullName,
          email: emailAddress.trim() || user.email,
          phone: phoneNumber.trim() || user.phone,
          streetAddress: address.trim(),
          avatarUrl: avatarPreview || user.avatarUrl,
        });
      }

      toast.success("Personal details updated successfully!");
      if (onSuccess) onSuccess();
      else onBackToProfile();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save personal details.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (firstName || lastName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Hidden file input for functional avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Personal details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Profile Photo (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#001B40] text-white mx-auto border-2 border-white shadow-xs flex items-center justify-center font-heading font-extrabold text-3xl">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Profile photo" fill className="object-cover" />
            ) : (
              <span>{initials}</span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-[#001B40] text-white shadow-xs hover:bg-[#074292] transition-colors cursor-pointer"
              title="Change photo"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Profile photo
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A photo helps clients and talents recognize you before you start jobs.
            </p>
          </div>
        </div>

        {/* Right Card: Personal Info Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Phone number
            </label>
            <input
              type="text"
              value={phoneNumber}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-neutral-400">
              Your phone number is verified and cannot be edited here.
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Email address
            </label>
            <input
              type="email"
              value={emailAddress}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-500 cursor-not-allowed"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#001B40]">
              Emergency contact
            </h4>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Contact name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Phone number
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Used for identity verification and safety.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onBackToProfile}
              className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ArtisanPersonalDetailsView;
