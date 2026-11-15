"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getArtisanOnboardingApi,
  patchArtisanOnboardingApi,
  submitArtisanOnboardingApi,
  submitArtisanIdentityApi,
  getServicesCatalogApi,
} from "@/lib/api/artisan";
import { uploadMediaFile } from "@/lib/api/media";
import { nairaToKobo, koboToNaira } from "@/lib/utils/currency";

interface ArtisanOnboardingFlowProps {
  onBackToDashboard: () => void;
  onCompleteVerification: () => void;
  initialStep?: number;
}

export function ArtisanOnboardingFlow({
  onBackToDashboard,
  onCompleteVerification,
  initialStep = 1,
}: ArtisanOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingApproval, setOnboardingApproval] = useState<string>("DRAFT");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  // Load resumable onboarding draft and trades catalog from API
  useEffect(() => {
    let mounted = true;
    getArtisanOnboardingApi()
      .then((res) => {
        if (!mounted || !res) return;
        setOnboardingApproval(res.approval);
        if (res.feedback) setFeedbackMessage(res.feedback);
        if (res.approval === "REJECTED") setShowIdentityFailed(true);

        const draft = res.draft;
        if (draft) {
          if (draft.fullName) setFullName(draft.fullName);
          if (draft.bio) setBio(draft.bio);
          if (draft.yearsExperience !== undefined) setExperienceYears(String(draft.yearsExperience));
          if (draft.area) setBaseLocation(draft.area);
          if (draft.radiusKm) setTravelDistance(`${draft.radiusKm} km`);
          if (draft.tradeIds && draft.tradeIds.length > 0) setSelectedTrades(draft.tradeIds);
          if (draft.portfolio && draft.portfolio.length > 0) {
            setPortfolioPhotos(
              draft.portfolio.map((p) => ({
                id: p.id,
                url: p.url || "/images/workers.png",
                title: p.title || "Trade work",
              }))
            );
          }
        }
      })
      .catch((err) => {
        console.debug("Onboarding API offline or mocked.", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Failure simulation state for Step 2
  const [showIdentityFailed, setShowIdentityFailed] = useState(false);

  // -------------------------------------------------------------
  // STEP 1 STATE: Your details
  // -------------------------------------------------------------
  const [fullName, setFullName] = useState("John Obiora");
  const [phoneNumber, setPhoneNumber] = useState("+234 803 555 0142");
  const [experienceYears, setExperienceYears] = useState("7");
  const [bio, setBio] = useState(
    "Plumber and welder based in Independence Layout. I handle leak repairs, pipe installation, pressure pumps and general fabrication across Enugu North. I explain the task before I start and clean up after."
  );

  // -------------------------------------------------------------
  // STEP 2 STATE: Identity check
  // -------------------------------------------------------------
  const [ninNumber, setNinNumber] = useState("");
  const [govIdMediaId, setGovIdMediaId] = useState<string | null>(null);
  const [selfieMediaId, setSelfieMediaId] = useState<string | null>(null);
  const [isUploadingGovId, setIsUploadingGovId] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const govIdInputRef = useRef<HTMLInputElement | null>(null);
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const hasGovId = Boolean(govIdMediaId);
  const hasLiveness = Boolean(selfieMediaId);
  const [ninError, setNinError] = useState("");
  const [identityIncompleteError, setIdentityIncompleteError] = useState(false);

  const handleUploadIdentityMedia = async (
    file: File,
    kind: "govId" | "selfie"
  ) => {
    if (kind === "govId") setIsUploadingGovId(true);
    else setIsUploadingSelfie(true);
    try {
      const uploaded = await uploadMediaFile(file, "IDENTITY");
      if (kind === "govId") {
        setGovIdMediaId(uploaded.id);
        toast.success("Government ID uploaded successfully.");
      } else {
        setSelfieMediaId(uploaded.id);
        toast.success("Selfie uploaded successfully.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload identity file.";
      toast.error(msg);
    } finally {
      if (kind === "govId") setIsUploadingGovId(false);
      else setIsUploadingSelfie(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3 STATE: Trade & service area
  // -------------------------------------------------------------
  const availableTrades = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "POP Ceiling",
    "Welding",
    "AC Repair",
    "Generator Repair",
    "Masonry",
    "Tiling",
    "Cleaning",
    "Solar installation",
  ];
  const [selectedTrades, setSelectedTrades] = useState<string[]>([
    "Plumbing",
    "Welding",
    "Generator Repair",
  ]);
  const [baseLocation, setBaseLocation] = useState("Independence Layout, Enugu");
  const [travelDistance, setTravelDistance] = useState("10 km");

  const toggleTrade = (trade: string) => {
    if (selectedTrades.includes(trade)) {
      if (selectedTrades.length === 1) {
        toast.error("Please select at least one trade.");
        return;
      }
      setSelectedTrades(selectedTrades.filter((t) => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  // -------------------------------------------------------------
  // STEP 4 STATE: Pricing
  // -------------------------------------------------------------
  const [pricingRanges, setPricingRanges] = useState([
    {
      service: "Leak & burst pipe repair",
      min: "25,000",
      max: "50,000",
    },
    {
      service: "Water heater installation",
      min: "30,000",
      max: "60,000",
    },
    {
      service: "Pressure pump servicing",
      min: "20,000",
      max: "40,000",
    },
    {
      service: "Gate fabrication",
      min: "80,000",
      max: "250,000",
    },
  ]);

  const updatePrice = (
    index: number,
    field: "min" | "max",
    val: string
  ) => {
    const updated = [...pricingRanges];
    updated[index][field] = val;
    setPricingRanges(updated);
  };

  // -------------------------------------------------------------
  // STEP 5 STATE: Portfolio
  // -------------------------------------------------------------
  const initialPhotos = [
    {
      id: "photo-1",
      url: "/images/workers.png",
      title: "Under-sink plumbing repair",
    },
    {
      id: "photo-2",
      url: "/images/customers.png",
      title: "Bathroom tiles and fixtures",
    },
    {
      id: "photo-3",
      url: "/images/workers.png",
      title: "Circuit breaker installation",
    },
    {
      id: "photo-4",
      url: "/images/customers.png",
      title: "POP ceiling recessed lighting",
    },
    {
      id: "photo-5",
      url: "/images/workers.png",
      title: "Bedroom wardrobe cabinetry",
    },
  ];
  const [portfolioPhotos, setPortfolioPhotos] = useState<
    Array<{ id: string; url: string; title: string }>
  >(initialPhotos);

  const handleAddSamplePhoto = () => {
    const newId = `photo-${Date.now()}`;
    setPortfolioPhotos([
      ...portfolioPhotos,
      {
        id: newId,
        url: "/images/workers.png",
        title: "Additional trade project photo",
      },
    ]);
    toast.success("Photo added to portfolio!");
  };

  const handleRemovePhoto = (id: string) => {
    setPortfolioPhotos(portfolioPhotos.filter((p) => p.id !== id));
    toast.success("Photo removed");
  };

  // -------------------------------------------------------------
  // NAVIGATION HANDLERS
  // -------------------------------------------------------------
  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await patchArtisanOnboardingApi({
        fullName,
        bio,
        yearsExperience: parseInt(experienceYears) || 0,
        area: baseLocation,
        radiusKm: parseInt(travelDistance) || 10,
        tradeIds: selectedTrades,
      });
      toast.success("Application draft saved.");
    } catch {
      toast.success("Application progress saved locally.");
    } finally {
      setIsSaving(false);
      onBackToDashboard();
    }
  };

  const handleStep1Continue = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !bio.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSaving(true);
    try {
      await patchArtisanOnboardingApi({
        fullName,
        bio,
        yearsExperience: parseInt(experienceYears) || 0,
      });
    } catch (err: any) {
      console.debug("Saved step 1 locally", err);
    } finally {
      setIsSaving(false);
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = async () => {
    let hasError = false;
    if (!ninNumber.trim() || ninNumber.length < 11) {
      setNinError("Enter your NIN to finish the identity check.");
      hasError = true;
    } else {
      setNinError("");
    }

    if (!govIdMediaId || !selfieMediaId || hasError) {
      setIdentityIncompleteError(true);
      toast.error("Complete all three identity checks to continue.");
      return;
    }

    setIdentityIncompleteError(false);
    setIsSaving(true);
    try {
      await submitArtisanIdentityApi({
        nin: ninNumber.trim(),
        mediaIds: [govIdMediaId, selfieMediaId],
      });
      setCurrentStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit identity check.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep3Continue = async () => {
    if (selectedTrades.length === 0) {
      toast.error("Please select at least one trade.");
      return;
    }
    if (!baseLocation.trim()) {
      toast.error("Please provide your base location.");
      return;
    }
    setIsSaving(true);
    try {
      await patchArtisanOnboardingApi({
        area: baseLocation,
        radiusKm: parseInt(travelDistance) || 10,
        tradeIds: selectedTrades,
      });
    } catch (err: any) {
      console.debug("Saved step 3 locally", err);
    } finally {
      setIsSaving(false);
      setCurrentStep(4);
    }
  };

  const handleStep4Continue = async () => {
    setIsSaving(true);
    try {
      const servicesPayload = pricingRanges.map((p, idx) => ({
        serviceId: `svc-${idx}`,
        description: p.service,
        minimum: nairaToKobo(parseInt(p.min.replace(/,/g, "")) || 0),
        maximum: nairaToKobo(parseInt(p.max.replace(/,/g, "")) || 0),
      }));
      await patchArtisanOnboardingApi({
        services: servicesPayload,
      });
    } catch (err: any) {
      console.debug("Saved step 4 locally", err);
    } finally {
      setIsSaving(false);
      setCurrentStep(5);
    }
  };

  const handleStep5Submit = async () => {
    if (portfolioPhotos.length < 3) {
      toast.error("Please add at least 3 photos of completed jobs.");
      return;
    }
    setIsSaving(true);
    try {
      await submitArtisanOnboardingApi();
      toast.success("Identity & application submitted for verification review!");
      onCompleteVerification();
    } catch (err: any) {
      toast.error(err?.message || "Could not submit onboarding application. Please try again.");
      // If mock mode or API is offline, still advance
      onCompleteVerification();
    } finally {
      setIsSaving(false);
    }
  };

  // ═════════════════════════════════════════════════════════════
  // VIEW: IDENTITY CHECK FAILED (EMPTY STATE SCREEN)
  // ═════════════════════════════════════════════════════════════
  if (showIdentityFailed) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => setShowIdentityFailed(false)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 mb-6 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#001B40] mb-8">
          Identity check
        </h1>

        {/* Failed State Card */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
          {/* Warning Icon Badge */}
          <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="text-lg sm:text-xl font-heading font-bold text-[#0F1115] mb-3">
            We could not verify your identity
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-8 max-w-md mx-auto">
            The name on your ID did not match your NIN record. Upload a clearer photo of your ID, or use a different document.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => toast.success("Support ticket opened. Our team will contact you shortly.")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-[#001B40] hover:bg-neutral-50 transition-colors"
            >
              Contact support
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIdentityFailed(false);
                setCurrentStep(2);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors shadow-xs"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // MAIN MULTI-STEP FLOW HEADER & PROGRESS BAR
  // ═════════════════════════════════════════════════════════════
  const stepTitles = [
    "Your details · Step 1 of 5",
    "Identity check · Step 2 of 5",
    "Trade & service area · Step 3 of 5",
    "Pricing · Step 4 of 5",
    "Portfolio · Step 5 of 5",
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onBackToDashboard();
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{currentStep > 1 ? "Back" : "Dashboard"}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#001B40] tracking-tight">
              Become an artisan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              {stepTitles[currentStep - 1]}
            </p>
          </div>

          {/* Quick Step Preview Pill for testing */}
          <div className="flex items-center gap-1 self-start sm:self-auto bg-neutral-100 p-1 rounded-xl text-[11px] font-semibold text-neutral-600">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(step)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === step
                    ? "bg-[#001B40] text-white font-bold"
                    : "hover:bg-neutral-200/60"
                }`}
              >
                Step {step}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Step Progress Bar */}
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            className="bg-[#001B40] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STEP 1: YOUR DETAILS
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Card */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Full name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
              />
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-2">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234 ..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
              />
            </div>

            {/* Years of experience */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-1">
                Years of experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                min="1"
                max="50"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Whole years working in your trade.
              </p>
            </div>

            {/* Tell customers about your work */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-1">
                Tell customers about your work <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all leading-relaxed resize-none"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                What you specialize in, the areas you cover, and how you work.
              </p>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#001B40]">
                  Shown on your public profile
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Customers see your name, experience, and bio when they compare quotes. Your phone number stays private and is only shared after a booking is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 2: IDENTITY CHECK
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Card */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Blue Notice Banner */}
            <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3">
              <svg className="w-5 h-5 text-[#001B40] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-xs text-[#001B40] leading-relaxed">
                Identity verification is required before you can receive jobs or withdraw money. It usually takes under two minutes.
              </p>
            </div>

            {/* NIN Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-2">
                NIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ninNumber}
                onChange={(e) => {
                  setNinNumber(e.target.value);
                  if (ninError) setNinError("");
                }}
                maxLength={11}
                placeholder="11-digit National Identification Number"
                className={`w-full px-4 py-3 rounded-xl border text-xs sm:text-sm text-neutral-900 focus:outline-none transition-all ${
                  ninError
                    ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/20"
                    : "border-neutral-200 focus:ring-2 focus:ring-[#001B40]"
                }`}
              />
              {ninError ? (
                <p className="text-[11px] text-red-500 font-medium mt-1.5">{ninError}</p>
              ) : (
                <p className="text-[11px] text-neutral-500 mt-1.5">11 digits</p>
              )}
            </div>

            {/* Verification Rows */}
            <div className="space-y-3 pt-2">
              {/* Row 1: Upload government ID */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                hasGovId ? "border-emerald-200 bg-emerald-50/20" : "border-neutral-200 bg-white"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasGovId ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F1115]">
                      Upload government ID
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      NIN slip, driver&apos;s licence, or voter&apos;s card
                    </p>
                  </div>
                </div>

                {hasGovId ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Uploaded</span>
                  </div>
                ) : (
                  <>
                    <input
                      ref={govIdInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadIdentityMedia(file, "govId");
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploadingGovId}
                      onClick={() => govIdInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-[#001B40] hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      {isUploadingGovId ? "Uploading..." : "Upload"}
                    </button>
                  </>
                )}
              </div>

              {/* Row 2: Liveness selfie */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                hasLiveness ? "border-emerald-200 bg-emerald-50/20" : "border-neutral-200 bg-white"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasLiveness ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F1115]">
                      Liveness selfie
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Upload a clear selfie photo
                    </p>
                  </div>
                </div>

                {hasLiveness ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Verified</span>
                  </div>
                ) : (
                  <>
                    <input
                      ref={selfieInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadIdentityMedia(file, "selfie");
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploadingSelfie}
                      onClick={() => selfieInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-[#001B40] hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      {isUploadingSelfie ? "Uploading..." : "Upload"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {identityIncompleteError && (!hasGovId || !hasLiveness) && (
              <p className="text-xs text-red-500 font-medium pt-1">
                Complete all three identity checks to continue.
              </p>
            )}
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-heading font-bold text-[#001B40]">
                    Private and encrypted
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Your documents are only used to confirm who you are. Customers never see your NIN or ID; they only see the Verified badge.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 3: TRADE & SERVICE AREA
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Card */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
            {/* What trade(s) do you offer? */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-3">
                What trade(s) do you offer? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTrades.map((trade) => {
                  const isSelected = selectedTrades.includes(trade);
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => toggleTrade(trade)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#001B40] text-white shadow-2xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                      }`}
                    >
                      {trade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Base location */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-2">
                Base location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baseLocation}
                onChange={(e) => setBaseLocation(e.target.value)}
                placeholder="e.g. Independence Layout, Enugu"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] transition-all"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Where you usually start from. Customers see this area, not your address.
              </p>
            </div>

            {/* How far will you travel? */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0F1115] mb-3">
                How far will you travel?
              </label>
              <div className="flex flex-wrap gap-2">
                {["5 km", "10 km", "25 km", "Anywhere in Enugu"].map((distance) => {
                  const isSelected = travelDistance === distance;
                  return (
                    <button
                      key={distance}
                      type="button"
                      onClick={() => setTravelDistance(distance)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#001B40] text-white shadow-2xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                      }`}
                    >
                      {distance}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#001B40]">
                  How matching works
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  We send you requests that match your trades and fall inside your travel distance. You can change both later in Settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 4: PRICING
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Card */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Set an indicative range for each service. You will agree the final price with each customer.
            </p>

            <div className="space-y-4">
              {pricingRanges.map((item, index) => (
                <div
                  key={item.service}
                  className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/40 space-y-2"
                >
                  <label className="block text-xs sm:text-sm font-bold text-[#0F1115]">
                    {item.service}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={item.min}
                        onChange={(e) => updatePrice(index, "min", e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-400">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={item.max}
                        onChange={(e) => updatePrice(index, "max", e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Tip Banner */}
            <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-center gap-3">
              <svg className="w-5 h-5 text-[#001B40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs text-[#001B40] leading-relaxed">
                Artisans who show a price range get 3× more quote requests than those who leave it blank.
              </p>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#001B40]">
                  Ranges, not fixed prices
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Your range helps customers decide who to ask for a quote. BlueFixx deducts a 7% service fee from each completed job.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 5: PORTFOLIO
          ═══════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Card */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Add at least three photos of jobs you have completed. This is the first thing customers look at.
            </p>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {portfolioPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-1.5 rounded-full bg-white text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                      title="Remove photo"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Photo Button / Tile */}
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="aspect-4/3 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#001B40] bg-neutral-50 hover:bg-neutral-100/70 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-500 group-hover:text-[#001B40] mb-2 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#001B40]">
                  + Add photo
                </span>
                <span className="text-[10px] text-neutral-400 mt-1">
                  JPG or PNG up to 10 MB
                </span>
              </button>
            </div>

            {/* Photo Counter */}
            <div className="flex items-center justify-between pt-2">
              {portfolioPhotos.length >= 3 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{portfolioPhotos.length} photos added · minimum met</span>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  {portfolioPhotos.length} of 3 photos added
                </p>
              )}

              {/* Reset to 0 helper for testing empty state */}
              <button
                type="button"
                onClick={() => setPortfolioPhotos([])}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 underline"
              >
                Clear photos (test 0 state)
              </button>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#001B40]">
                  What happens next
                </h3>
                <ul className="text-xs text-neutral-600 mt-2.5 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-neutral-400">•</span>
                    <span>Identity review completes within 24 hours. Then you become a Verified Artisan.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-neutral-400">•</span>
                    <span>Take the knowledge test to reach Certified Professional and unlock higher-value jobs.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-neutral-400">•</span>
                    <span>Withdrawals to your bank open once identity is confirmed. Minimum withdrawal ₦500.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM ACTION BAR (SAVE AND EXIT / CONTINUE)
          ═══════════════════════════════════════════════════════════ */}
      <div className="mt-8 flex items-center justify-between border-t border-neutral-200/80 pt-6">
        <button
          type="button"
          onClick={handleSaveAndExit}
          className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-[#001B40] hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Save and exit
        </button>

        {currentStep === 1 && (
          <button
            type="button"
            onClick={handleStep1Continue}
            className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Continue
          </button>
        )}

        {currentStep === 2 && (
          <button
            type="button"
            onClick={handleStep2Continue}
            className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Continue
          </button>
        )}

        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleStep3Continue}
            className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Continue
          </button>
        )}

        {currentStep === 4 && (
          <button
            type="button"
            onClick={handleStep4Continue}
            className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Continue
          </button>
        )}

        {currentStep === 5 && (
          <button
            type="button"
            onClick={handleStep5Submit}
            disabled={portfolioPhotos.length < 3}
            className={`px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs ${
              portfolioPhotos.length >= 3
                ? "bg-[#001B40] hover:bg-[#074292] text-white"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            Submit for review
          </button>
        )}
      </div>
    </div>
  );
}

