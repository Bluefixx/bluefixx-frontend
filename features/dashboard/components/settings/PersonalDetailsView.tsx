"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { updateAccountProfileApi, getAccountProfileApi, uploadMediaFile } from "@/lib/api";
import { useAuth } from "@/lib/stores/auth-store";

interface PersonalDetailsViewProps {
  onBack: () => void;
  userData: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl?: string;
  };
  onUpdateUserData: (data: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl?: string;
  }) => void;
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

export function PersonalDetailsView({
  onBack,
  userData,
  onUpdateUserData,
}: PersonalDetailsViewProps) {
  const { user, setUser } = useAuth();
  const nameParts = (user?.fullName || userData.fullName || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user?.phone || userData.phone || "");
  const [email, setEmail] = useState(user?.email || userData.email || "");
  const [address, setAddress] = useState(userData.location || "");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarMediaId, setAvatarMediaId] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getAccountProfileApi();
        if (profile) {
          const profileUser = (profile as any)?.user || profile;
          const profileSettings = (profile as any)?.settings;

          if (profileUser.fullName) {
            const parts = profileUser.fullName.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (profileUser.email) setEmail(profileUser.email);
          if (profileUser.phone) setPhone(profileUser.phone);
          if (profileUser.avatarUrl) setAvatarPreview(profileUser.avatarUrl);

          if (profileSettings?.emergencyName) {
            setEmergencyName(profileSettings.emergencyName);
          } else if (profile.emergencyContact?.name) {
            setEmergencyName(profile.emergencyContact.name);
          }

          if (profileSettings?.emergencyPhone) {
            setEmergencyPhone(profileSettings.emergencyPhone);
          } else if (profile.emergencyContact?.phone) {
            setEmergencyPhone(profile.emergencyContact.phone);
          }
        }
      } catch {
        // Fallback to initial props
      }
    }
    loadProfile();
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
    } catch {
      toast.success("Profile photo updated locally");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Normalize and validate emergencyPhone if provided
    let sanitizedEmergencyPhone = "";
    if (emergencyPhone.trim()) {
      sanitizedEmergencyPhone = normalizeE164Phone(emergencyPhone);
      const e164Regex = /^\+[1-9]\d{7,14}$/;
      if (!e164Regex.test(sanitizedEmergencyPhone)) {
        setIsSaving(false);
        toast.error("Emergency phone must be in international format (e.g. +2348012345678)");
        return;
      }
    }

    try {
      await updateAccountProfileApi({
        fullName: updatedFullName,
        photoId: avatarMediaId,
        emergencyName: emergencyName.trim(),
        emergencyPhone: sanitizedEmergencyPhone,
        language: "en",
      });

      if (user) {
        setUser({
          ...user,
          fullName: updatedFullName,
          email: email.trim(),
          phone: phone.trim(),
          avatarUrl: avatarPreview || user.avatarUrl,
        });
      }

      onUpdateUserData({
        fullName: updatedFullName,
        email: email.trim(),
        phone: phone.trim(),
        location: address.trim(),
        avatarUrl: avatarPreview,
      });

      toast.success("Personal details saved successfully");
      onBack();
    } catch (err: any) {
      const errMsg =
        err?.message ||
        err?.response?.data?.error?.message ||
        "Failed to save personal details. Please check your inputs.";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Hidden file input for functional avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Breadcrumb & Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Personal details
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Keep your profile and emergency contact up to date.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          {/* Profile Photo Row */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-neutral-100 bg-[#001B40] text-white flex items-center justify-center font-bold text-2xl">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={firstName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{firstName ? firstName.charAt(0).toUpperCase() : (user?.fullName?.charAt(0).toUpperCase() || "U")}</span>
                )}
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#001B40]">
                  Profile photo
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mt-0.5">
                  A clear photo helps build trust with verified artisans who arrive for your jobs.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Change photo
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-600">
                Phone number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-600">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-600">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
              />
            </div>

            {/* Emergency Contact Section */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-[#001B40]">
                Emergency contact
              </h4>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600">
                  Contact name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600">
                  Phone number
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-hidden focus:border-[#001B40] transition-colors"
                />
              </div>

              <p className="text-[11px] text-neutral-400">
                Used by the Safety Center during an active job.
              </p>
            </div>

            {/* Action CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <span>Save changes</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#001B40]">
            Your profile
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            These details help us keep you informed about your bookings and payments.
          </p>

          <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
            <span className="font-bold text-[#001B40] block">
              Emergency contact
            </span>
            <p className="text-neutral-500">
              Your emergency contact is used by the Safety Center during an active job.
            </p>
            <p className="font-semibold text-neutral-800 pt-1">
              {emergencyName} · {emergencyPhone}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
            <span className="font-bold text-[#001B40] block">
              Keep your details current
            </span>
            <p className="text-neutral-500 leading-relaxed">
              Use a phone number and email address you can access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
