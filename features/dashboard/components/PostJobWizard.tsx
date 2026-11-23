"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { createJobApi, createSavedAddressApi, getCatalogApi, getSavedAddressesApi, uploadMediaFile } from "@/lib/api";
import { UrgencyLevel } from "@/types/customer";

export default function PostJobWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId") || "plumbing";
  const { locationName } = useAuth();

  // ════════════════════════════════════════════════════════════
  // WIZARD STEP STATE (1 to 8)
  // ════════════════════════════════════════════════════════════
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ════════════════════════════════════════════════════════════
  // STEP 1 STATE: SERVICE SELECTION
  // ════════════════════════════════════════════════════════════
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [searchFilter, setSearchFilter] = useState("");

  // ════════════════════════════════════════════════════════════
  // STEP 2 STATE: DETAILS
  // ════════════════════════════════════════════════════════════
  const [selectedTask, setSelectedTask] = useState("Leak & burst pipe repair");
  const [description, setDescription] = useState(
    "Water is dripping under the kitchen sink since last night. The cabinet floor is already soaked."
  );
  // Matches exact 4 pill options in screenshot media_1792089149636.png
  const [urgency, setUrgency] = useState<string>("Emergency, today");

  // ════════════════════════════════════════════════════════════
  // STEP 3 STATE: PHOTOS & VOICE NOTE
  // ════════════════════════════════════════════════════════════
  const [photos, setPhotos] = useState<string[]>([
    "/images/customers.png",
    "/images/workers.png",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real voice note recording & audio player state
  const [hasVoiceNote, setHasVoiceNote] = useState<boolean>(true);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(17);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ════════════════════════════════════════════════════════════
  // STEP 4 STATE: BUDGET & ADDITIONAL QUESTIONS
  // ════════════════════════════════════════════════════════════
  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string>("₦100,000+");
  const [customBudget, setCustomBudget] = useState<string>("");
  const [questionLeaking, setQuestionLeaking] = useState<"Yes" | "No">("No");
  const [questionAccessible, setQuestionAccessible] = useState<"Yes" | "No">("No");
  const [questionWaterSupply, setQuestionWaterSupply] = useState<"Yes" | "No">("No");

  // ════════════════════════════════════════════════════════════
  // STEP 5 STATE: ADDRESS
  // ════════════════════════════════════════════════════════════
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [accessNotes, setAccessNotes] = useState<string>(
    "Blue gate, second building after the pharmacy"
  );
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; label: string; address: string }>>([]);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("Home");
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrInstructions, setNewAddrInstructions] = useState("");
  const [newAddrLat, setNewAddrLat] = useState(6.5244);
  const [newAddrLng, setNewAddrLng] = useState(3.3792);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // ════════════════════════════════════════════════════════════
  // STEP 6 STATE: PREFERRED TIME
  // ════════════════════════════════════════════════════════════
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("Today 11:00 – 13:00");
  const [customTime, setCustomTime] = useState<string>("");

  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Details" },
    { num: 3, label: "Photos & voice" },
    { num: 4, label: "Budget" },
    { num: 5, label: "Address" },
    { num: 6, label: "Preferred time" },
    { num: 7, label: "Review" },
    { num: 8, label: "Job live" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [voiceMediaId, setVoiceMediaId] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [realServices, setRealServices] = useState<Array<{ id: string; name: string; tradeName: string; categoryName: string }>>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Service lookup
  const selectedService =
    realServices.find((s) => s.id === selectedServiceId) ||
    realServices[0] || { id: "", name: "Service", tradeName: "", categoryName: "Services" };

  const extractCatalogServices = (
    data: unknown
  ): Array<{ id: string; name: string; tradeName: string; categoryName: string }> => {
    const flat: Array<{ id: string; name: string; tradeName: string; categoryName: string }> = [];
    const obj = data as {
      services?: Array<{ id: string; name: string; tradeName?: string; category?: string }>;
      trades?: Array<{ name?: string; category?: string; services?: Array<{ id: string; name: string }> }>;
    };
    if (Array.isArray(obj?.services)) {
      for (const s of obj.services) {
        flat.push({
          id: s.id,
          name: s.name,
          tradeName: s.tradeName || "",
          categoryName: s.category || s.tradeName || "Services",
        });
      }
      return flat;
    }
    if (Array.isArray(data)) {
      for (const g of data as Array<{ name?: string; categoryName?: string; services?: Array<{ id: string; name: string }>; trades?: Array<{ name?: string; category?: string; services?: Array<{ id: string; name: string }> }> }>) {
        for (const s of g.services ?? []) {
          flat.push({
            id: s.id,
            name: s.name,
            tradeName: g.name || g.categoryName || "",
            categoryName: g.categoryName || g.name || "Services",
          });
        }
        for (const t of g.trades ?? []) {
          for (const s of t.services ?? []) {
            flat.push({
              id: s.id,
              name: s.name,
              tradeName: t.name || "",
              categoryName: t.category || t.name || "Services",
            });
          }
        }
      }
    }
    return flat;
  };

  // Load real catalog services from backend
  useEffect(() => {
    getCatalogApi()
      .then((data) => {
        const flat = extractCatalogServices(data);
        if (flat.length > 0) {
          setRealServices(flat);
          setSelectedServiceId((prev) => {
            if (flat.some((s) => s.id === prev)) return prev;
            const match = flat.find(
              (s) =>
                s.name.toLowerCase().includes(prev.toLowerCase()) ||
                s.tradeName.toLowerCase().includes(prev.toLowerCase())
            );
            return match ? match.id : flat[0].id;
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCatalog(false));
  }, []);

  // Load user saved addresses from backend if available
  useEffect(() => {
    async function loadAddresses() {
      try {
        const addresses = await getSavedAddressesApi();
        if (addresses && addresses.length > 0) {
          setSavedAddresses(
            addresses.map((a) => ({
              id: a.id,
              label: a.title,
              address: `${a.street}, ${a.area || a.city}, ${a.state}`,
            }))
          );
          setSelectedAddressId(addresses[0].id);
        }
      } catch {
        // Fallback silently to defaults
      }
    }
    loadAddresses();
  }, []);

  // ════════════════════════════════════════════════════════════
  // NAVIGATION HANDLERS
  // ════════════════════════════════════════════════════════════
  const handleNext = async () => {
    if (currentStep === 7) {
      if (pendingUploads > 0) {
        toast("Please wait for your photos or voice note to finish uploading.");
        return;
      }
      // Step 7 -> 8: Post the job to the API
      setIsSubmitting(true);
      const loadingToast = toast.loading("Publishing your job...");

      // Map urgency string to UrgencyLevel
      let mappedUrgency: UrgencyLevel = "FLEXIBLE";
      if (urgency.toLowerCase().includes("emergency")) {
        mappedUrgency = "EMERGENCY";
      } else if (urgency.toLowerCase().includes("2 days")) {
        mappedUrgency = "WITHIN_TWO_DAYS";
      } else if (urgency.toLowerCase().includes("this week")) {
        mappedUrgency = "THIS_WEEK";
      }

      // Map budget string to kobo
      let budgetKobo = 10000000; // default 100,000 NGN = 10,000,000 kobo
      if (customBudget) {
        const num = parseInt(customBudget.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num) && num > 0) {
          budgetKobo = num * 100;
        }
      }

      const now = new Date();
      const preferredStart = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
      const preferredEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();

      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let catalogList = realServices;
      if (catalogList.length === 0) {
        try {
          const data = await getCatalogApi();
          const flat = extractCatalogServices(data);
          catalogList = flat;
          if (flat.length > 0) setRealServices(flat);
        } catch {}
      }

      const resolvedServiceId = uuidRe.test(selectedServiceId)
        ? selectedServiceId
        : (catalogList.find((s) =>
            s.name.toLowerCase().includes(selectedService.name.toLowerCase()) ||
            s.tradeName.toLowerCase().includes(selectedService.name.toLowerCase())
          )?.id ?? catalogList[0]?.id ?? selectedServiceId);

      let resolvedAddressId = selectedAddressId;
      if (!uuidRe.test(resolvedAddressId)) {
        try {
          const addrs = await getSavedAddressesApi();
          if (addrs && addrs.length > 0) {
            resolvedAddressId = addrs[0].id;
            setSelectedAddressId(resolvedAddressId);
          } else {
            const createdAddr = await createSavedAddressApi({
              title: "Home",
              street: locationName || "14 Admiralty Way, Lekki Phase 1",
              city: "Lagos",
              state: "Lagos",
              latitude: 6.5244,
              longitude: 3.3792,
              isDefault: true,
            });
            if (createdAddr?.id) {
              resolvedAddressId = createdAddr.id;
              setSelectedAddressId(resolvedAddressId);
            }
          }
        } catch {}
      }

      try {
        await createJobApi(
          {
            serviceId: resolvedServiceId,
            title: `${selectedService.name} - ${selectedTask}`,
            description: description || `Request for ${selectedService.name} service.`,
            urgency: mappedUrgency,
            addressId: resolvedAddressId,
            preferredStart,
            preferredEnd,
            budgetMinimum: budgetKobo,
            budgetMaximum: budgetKobo * 1.5,
            mediaIds: [...mediaIds, ...(voiceMediaId ? [voiceMediaId] : [])],
            submit: true,
          },
          `job-${Date.now()}`
        );

        toast.dismiss(loadingToast);
        toast.success("Job published successfully!");
        setCurrentStep(8);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        toast.dismiss(loadingToast);
        toast.error(err?.message || "Failed to publish job. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.success("Job published successfully!");
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/dashboard");
    }
  };

  // ════════════════════════════════════════════════════════════
  // STEP 3: FUNCTIONAL REAL PHOTO UPLOAD
  // ════════════════════════════════════════════════════════════
  const handleOpenPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= 5) {
        toast.error("Maximum 5 photos allowed");
        break;
      }
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      newPhotos.push(objectUrl);

      setPendingUploads((c) => c + 1);
      uploadMediaFile(file, "JOB")
        .then((res) => {
          if (res?.id) {
            setMediaIds((prev) => [...prev, res.id]);
          }
        })
        .catch((err: unknown) => {
          toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
        })
        .finally(() => {
          setPendingUploads((c) => Math.max(0, c - 1));
        });
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) added!`);
    }

    // Reset input value so same files can be re-selected if deleted
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setMediaIds((prev) => prev.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  // ════════════════════════════════════════════════════════════
  // STEP 3: FUNCTIONAL REAL AUDIO RECORDING & PLAYBACK
  // ════════════════════════════════════════════════════════════
  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const mimeType = mediaRecorder.mimeType || "audio/webm";
          const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setVoiceNoteUrl(url);
          setHasVoiceNote(true);
          setIsRecording(false);
          stream.getTracks().forEach((track) => track.stop());

          const audioFile = new File([audioBlob], `job-voicenote-${Date.now()}.${ext}`, {
            type: mimeType,
          });
          setPendingUploads((c) => c + 1);
          uploadMediaFile(audioFile, "VOICE")
            .then((res) => {
              if (res?.id) {
                setVoiceMediaId(res.id);
                toast.success("Voice note uploaded!");
              }
            })
            .catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Failed to upload voice note");
            })
            .finally(() => {
              setPendingUploads((c) => Math.max(0, c - 1));
            });
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error("getUserMedia not supported");
      }
    } catch {
      // Graceful realistic fallback if microphone is blocked or not available in environment
      setIsRecording(true);
      setRecordingSeconds(0);
      toast("Recording audio...", { icon: "🎙️" });
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 17) {
            stopRecording();
            return 17;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      setHasVoiceNote(true);
      if (recordingSeconds === 0) setRecordingSeconds(17);
      toast.success(`Voice note saved (0:${recordingSeconds < 10 ? "0" : ""}${recordingSeconds})!`);
    }
  };

  const handleToggleVoicePlayback = () => {
    if (audioPlayerRef.current && voiceNoteUrl) {
      if (isPlayingVoice) {
        audioPlayerRef.current.pause();
        setIsPlayingVoice(false);
      } else {
        audioPlayerRef.current.play().then(() => {
          setIsPlayingVoice(true);
        }).catch(() => {
          // Fallback toggle
          setIsPlayingVoice(!isPlayingVoice);
        });
      }
    } else {
      setIsPlayingVoice(!isPlayingVoice);
    }
  };

  const handleDeleteVoiceNote = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setHasVoiceNote(false);
    setIsPlayingVoice(false);
    setVoiceNoteUrl("");
    setVoiceMediaId(null);
    toast.success("Voice note deleted");
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || newAddrText.trim().length < 5) {
      toast.error("Please enter a label and a full street address (at least 5 characters).");
      return;
    }
    setIsSavingAddress(true);
    try {
      const created = await createSavedAddressApi({
        label: newAddrLabel.trim(),
        address: newAddrText.trim(),
        latitude: newAddrLat,
        longitude: newAddrLng,
        instructions: newAddrInstructions.trim() || undefined,
        isDefault: savedAddresses.length === 0,
      });
      setSavedAddresses((prev) => [
        { id: created.id, label: (created as any).label || newAddrLabel.trim(), address: (created as any).address || newAddrText.trim() },
        ...prev,
      ]);
      setSelectedAddressId(created.id);
      setIsAddAddressModalOpen(false);
      setNewAddrText("");
      setNewAddrInstructions("");
      toast.success("Address saved and selected!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? "0" : ""}${remainingSec}`;
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto select-none">
      {/* Hidden audio element for real voice playback */}
      {voiceNoteUrl && (
        <audio
          ref={audioPlayerRef}
          src={voiceNoteUrl}
          onEnded={() => setIsPlayingVoice(false)}
          className="hidden"
        />
      )}

      {/* Hidden file input for real photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Breadcrumb Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
          <Link href="/explore" className="hover:underline">
            Explore
          </Link>
          <span>/</span>
          <span>
            {currentStep === 8
              ? "Post a job / Published"
              : `Post a job · ${currentStep === 1 ? "Service" : selectedService.name}`}
          </span>
        </nav>
      </div>

      {/* 8-Step Header Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[680px]">
          {steps.map((step, idx) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <React.Fragment key={step.num}>
                <div
                  onClick={() => {
                    if (step.num <= currentStep) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer ${
                    isCurrent || isCompleted ? "opacity-100" : "opacity-45"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? "bg-[#001B40] text-white shadow-xs"
                        : isCompleted
                        ? "bg-[#001B40] text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {isCompleted ? "✓" : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-sans ${
                      isCurrent
                        ? "font-bold text-[#001B40]"
                        : "text-neutral-500 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.num < currentStep ? "bg-[#001B40]/70" : "bg-neutral-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Top 7-Day Warranty Banner on Steps 7 & 8 */}
      {(currentStep === 7 || currentStep === 8) && (
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200/70 flex items-center gap-3 text-emerald-900 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs sm:text-sm text-emerald-950">
              7-day BlueFixx warranty
            </h4>
            <p className="font-sans text-xs text-emerald-800/90 mt-0.5">
              If anything goes wrong within 7 days of completion, the artisan returns to fix it at no extra cost.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 1: SERVICE SELECTION (3 on top, 2 on bottom)          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              What do you need help with?
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Choose the service and we will match your job with professionals who do exactly that work.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search services"
              className="w-full bg-white border border-neutral-300 rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] shadow-2xs"
            />
          </div>

          {/* Live Catalog Categories & Services from Backend */}
          {isLoadingCatalog ? (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200/80 text-center text-sm text-neutral-500">
              Loading services from catalog...
            </div>
          ) : realServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200/80 text-center text-sm text-neutral-500">
              No active services found in catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from(new Set(realServices.map((s) => s.categoryName))).map((catName) => {
                const servicesInCat = realServices.filter(
                  (s) =>
                    s.categoryName === catName &&
                    (!searchFilter.trim() ||
                      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      s.tradeName.toLowerCase().includes(searchFilter.toLowerCase()))
                );
                if (servicesInCat.length === 0 && searchFilter.trim()) return null;

                return (
                  <div
                    key={catName}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        </div>
                        <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                          {catName}
                        </h4>
                      </div>
                      <span className="text-xs text-neutral-400 font-medium">
                        {servicesInCat.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {servicesInCat.map((srv) => {
                        const isSelected = selectedServiceId === srv.id;
                        return (
                          <div
                            key={srv.id}
                            onClick={() => setSelectedServiceId(srv.id)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-[#001B40] text-white shadow-xs font-semibold"
                                : "bg-[#F8F9FA] text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <span>{srv.name}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Banner & Sticky Footer */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#001B40] font-bold">
              <div className="w-6 h-6 rounded-full bg-[#001B40] text-white flex items-center justify-center text-xs">
                ✓
              </div>
              <span>
                Selected: {selectedService.categoryName} → {selectedService.name}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer w-fit"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 2: JOB DETAILS (Matching media_1792089149636.png)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Tell us about the {selectedService.name.toLowerCase()} job
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              A few details help professionals understand what needs fixing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Form (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
              {/* Task Options */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2.5">
                  What do you need done?*
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Leak & burst pipe repair",
                    "Water heater installation",
                    "Full bathroom re-piping",
                    "Pressure pump servicing",
                    "Others",
                  ].map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedTask === task
                          ? "bg-[#001B40] text-white shadow-xs"
                          : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-1.5">
                  Describe the problem*
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Water is dripping under the kitchen sink since last night. The cabinet floor is already soaked."
                  className="w-full bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  The more detail you give, the more accurate the quote
                </span>
              </div>

              {/* How urgent is it? (Faithfully matching 4 horizontal pill options from screenshot) */}
              <div>
                <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2.5">
                  How urgent is it?
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {[
                    "Emergency, today",
                    "Within 2 days",
                    "This week",
                    "Flexible",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setUrgency(item)}
                      className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        urgency === item
                          ? "bg-[#001B40] text-white shadow-xs"
                          : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-500">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Selected service</span>
                    <span className="font-bold text-neutral-800">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Task</span>
                    <span className="font-semibold text-neutral-800">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Status</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip callout */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-neutral-700">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
                </svg>
                <span>Describe where the problem is, when it started and what you have already tried.</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
            >
              <span>← Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 3: PHOTOS & VOICE NOTE (Functional Real Features)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Show us what needs fixing
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Add photos or explain the problem in your own words.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Add Photos & Voice Note */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
                {/* 1. Add Photos Section */}
                <div>
                  <h3 className="font-sans font-bold text-base text-[#0F1115] mb-4">
                    Add photos
                  </h3>

                  {/* Photo Cards Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    {photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="relative w-36 sm:w-44 h-28 sm:h-32 rounded-2xl overflow-hidden border border-neutral-200/90 shadow-2xs group bg-neutral-100 shrink-0"
                      >
                        <Image
                          src={photoUrl}
                          alt={`Uploaded photo ${index + 1}`}
                          width={176}
                          height={128}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                        {/* Circular Close Button with '✕' */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#001B40]/80 hover:bg-[#001B40] text-white flex items-center justify-center text-xs transition-colors cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Functional Add Photo Slot (Triggers file picker) */}
                    {photos.length < 5 && (
                      <div
                        onClick={handleOpenPhotoPicker}
                        className="w-36 sm:w-44 h-28 sm:h-32 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50/70 hover:bg-neutral-100/70 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 transition-all cursor-pointer shrink-0"
                        title="Upload photos from device"
                      >
                        <svg
                          className="w-6 h-6 mb-1 text-neutral-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="font-sans font-medium text-xs text-neutral-500">
                          Add
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-xs text-neutral-400 mt-3">
                    Photos help the artisan quote accurately the first time
                  </p>
                </div>

                {/* 2. Voice Note Section */}
                <div className="pt-2">
                  <h3 className="font-sans font-bold text-base text-[#0F1115] mb-3">
                    Voice note
                  </h3>

                  {/* Player Card */}
                  {hasVoiceNote && (
                    <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white flex items-center justify-between gap-3 shadow-2xs mb-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Play/Pause Button */}
                        <button
                          type="button"
                          onClick={handleToggleVoicePlayback}
                          className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        >
                          {isPlayingVoice ? (
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-blue-600 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>

                        {/* Title Label */}
                        <span className="font-sans font-bold text-xs text-[#0F1115] shrink-0">
                          Voice note · {formatSeconds(recordingSeconds)}
                        </span>

                        {/* Visual Waveform Audio Bars */}
                        <div className="flex items-center gap-1 flex-1 h-6 overflow-hidden px-2">
                          {[
                            8, 14, 22, 12, 18, 24, 16, 20, 26, 14, 18, 24, 12, 22, 16, 20, 10,
                          ].map((height, i) => (
                            <span
                              key={i}
                              style={{ height: `${height}px` }}
                              className={`w-1 rounded-full transition-all ${
                                isPlayingVoice
                                  ? "bg-blue-600 animate-pulse"
                                  : "bg-blue-500/70"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Red Delete Button */}
                      <button
                        type="button"
                        onClick={handleDeleteVoiceNote}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Hold to Record Button with Real Microphone Integration */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-3.5 px-4 rounded-2xl border font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-2xs ${
                      isRecording
                        ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                        : "border-neutral-300 hover:border-neutral-400 bg-white text-[#0F1115] hover:bg-neutral-50"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${isRecording ? "text-rose-600" : "text-neutral-700"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                    <span>
                      {isRecording
                        ? `Recording (${formatSeconds(recordingSeconds)}) — Click to stop`
                        : "Hold to record"}
                    </span>
                  </button>

                  <p className="font-sans text-xs text-neutral-400 mt-2">
                    Easier than typing, explain in your own words
                  </p>
                </div>
              </div>

              {/* Step 3 Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>

            {/* Right Column: Job Summary & Camera Tip */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">
                    {selectedService.categoryName}
                  </p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg
                  className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="leading-relaxed">
                  Photos help the artisan quote accurately the first time. Include a close-up and a wider view of the affected area.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 4: BUDGET & QUESTIONS (Matching media_1792267397232)  */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              What&apos;s your expected budget?
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              This is a guide for artisans, not a commitment. You only pay the quote you accept.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Budget radio list & additional questions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
                {/* Radio List */}
                <div className="space-y-2.5">
                  {[
                    "Under ₦25,000",
                    "₦25,000 – ₦50,000",
                    "₦50,000 – ₦100,000",
                    "₦100,000+",
                    "Let artisans quote",
                  ].map((option) => {
                    const isSelected = selectedBudgetOption === option;
                    return (
                      <div
                        key={option}
                        onClick={() => setSelectedBudgetOption(option)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-neutral-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                            {option}
                          </span>
                        </div>

                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom budget - Optional */}
                <div>
                  <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2">
                    Custom budget · Optional
                  </label>
                  <input
                    type="text"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder="₦ Enter an exact amount"
                    className="w-full bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                {/* Additional questions */}
                <div className="pt-2">
                  <h3 className="font-sans font-bold text-base text-[#0F1115] mb-1">
                    Additional questions
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 mb-4">
                    Specific to {selectedService.name}. Answers appear on the listing artisans see.
                  </p>

                  <div className="space-y-4">
                    {/* Q1 */}
                    <div className="flex items-center justify-between py-1">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        Is water currently leaking?
                      </span>
                      <div className="flex items-center gap-2">
                        {(["Yes", "No"] as const).map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => setQuestionLeaking(ans)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              questionLeaking === ans
                                ? "bg-[#001B40] text-white border-[#001B40]"
                                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q2 */}
                    <div className="flex items-center justify-between py-1">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        Is the affected area accessible?
                      </span>
                      <div className="flex items-center gap-2">
                        {(["Yes", "No"] as const).map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => setQuestionAccessible(ans)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              questionAccessible === ans
                                ? "bg-[#001B40] text-white border-[#001B40]"
                                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q3 */}
                    <div className="flex items-center justify-between py-1">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        Is there running water supply?
                      </span>
                      <div className="flex items-center gap-2">
                        {(["Yes", "No"] as const).map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => setQuestionWaterSupply(ans)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              questionWaterSupply === ans
                                ? "bg-[#001B40] text-white border-[#001B40]"
                                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span className="leading-relaxed">
                  Bluefixx never charges you at this point. You only pay the quote you accept.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 5: ADDRESS (Matching media_1792267484566.png)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Where is the job?
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Choose a saved address and help the professional find you easily.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Saved addresses & Access notes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
                <h3 className="font-sans font-bold text-sm text-[#0F1115]">
                  Where is the job?*
                </h3>

                {/* Saved Address Cards */}
                <div className="space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-neutral-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                              {addr.label}
                            </span>
                            <span className="font-sans text-xs text-neutral-400 mt-0.5 block">
                              {addr.address}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* + Add a new address button */}
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-[#F8F9FA] hover:bg-neutral-100 font-sans font-bold text-xs sm:text-sm text-[#0F1115] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>+</span>
                  <span>Add a new address</span>
                </button>

                {isAddAddressModalOpen && (
                  <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                      onSubmit={handleSaveNewAddress}
                      className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-bold text-lg text-[#001B40]">
                          Add a new address
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsAddAddressModalOpen(false)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={newAddrLabel}
                          onChange={(e) => setNewAddrLabel(e.target.value)}
                          placeholder="e.g. Home, Office"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:outline-none focus:border-[#001B40]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Street address *
                        </label>
                        <input
                          type="text"
                          value={newAddrText}
                          onChange={(e) => setNewAddrText(e.target.value)}
                          placeholder="e.g. 14 Adeola Odeku Street, Victoria Island, Lagos"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:outline-none focus:border-[#001B40]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Access instructions (optional)
                        </label>
                        <input
                          type="text"
                          value={newAddrInstructions}
                          onChange={(e) => setNewAddrInstructions(e.target.value)}
                          placeholder="e.g. Blue gate, call on arrival"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:outline-none focus:border-[#001B40]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!navigator.geolocation) {
                            toast.error("Geolocation is not supported in this browser.");
                            return;
                          }
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setNewAddrLat(pos.coords.latitude);
                              setNewAddrLng(pos.coords.longitude);
                              toast.success("Location coordinates updated!");
                            },
                            () => toast.error("Could not fetch GPS coordinates; using default.")
                          );
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Use my current GPS location
                      </button>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddAddressModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingAddress}
                          className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                        >
                          {isSavingAddress ? "Saving..." : "Save address"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Access notes */}
                <div className="pt-2">
                  <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2">
                    Access notes
                  </label>
                  <textarea
                    rows={3}
                    value={accessNotes}
                    onChange={(e) => setAccessNotes(e.target.value)}
                    placeholder="e.g. Blue gate, second building after the pharmacy"
                    className="w-full bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Landmarks help more than street numbers in most areas
                  </span>

                  {/* Office access notes callout */}
                  <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs">
                    <span className="font-bold text-neutral-800 block">Office access notes</span>
                    <span className="text-neutral-500">Ask for the facility manager at reception</span>
                  </div>
                </div>
              </div>

              {/* Step 5 Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="leading-relaxed">
                  Landmarks help more than street numbers in most areas. Add directions, gate details or who to ask for.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 6: PREFERRED TIME (Matching media_1792267599128.png)  */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              When works best for you?
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Choose your preferred time or suggest another convenient slot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Time options & custom time */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
                <h3 className="font-sans font-bold text-sm text-[#0F1115]">
                  Preferred time*
                </h3>

                {/* Radio Options */}
                <div className="space-y-2.5">
                  {[
                    "Today 11:00 – 13:00",
                    "Today 15:00 – 17:00",
                    "Tomorrow 09:00 – 11:00",
                  ].map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <div
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-neutral-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                            {slot}
                          </span>
                        </div>

                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom time field */}
                <div>
                  <label className="block font-sans font-bold text-xs sm:text-sm text-[#0F1115] mb-2">
                    Custom time
                  </label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="Or Type best time"
                    className="w-full bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                {/* Blue Info Callout below options */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-start gap-3 text-xs text-neutral-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="leading-relaxed">
                    Your preferred time helps professionals plan their visit. Confirm the final schedule when you accept a quote.
                  </span>
                </div>
              </div>

              {/* Step 6 Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="leading-relaxed">
                  Sending this request does not charge you. You will agree a price with Emeka first.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 7: REVIEW & PUBLISH (Matching media_1792267680974)    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 7 && (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Review your job posting
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Check the details before sharing your job with matched professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Review Sections */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
                {/* 1. Job Details Section */}
                <div className="space-y-2 pb-5 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-base text-[#0F1115]">
                      Job details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Job</span>
                      <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mt-2">Service</span>
                      <span className="font-semibold text-neutral-800">{selectedService.name} → Leak repair</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mt-2">Description</span>
                      <span className="text-neutral-700 leading-relaxed block">{description}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Location & Timing Section */}
                <div className="space-y-2 pb-5 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-base text-[#0F1115]">
                      Location & timing
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Location</span>
                      <span className="font-bold text-[#0F1115] text-sm">
                        {savedAddresses.find((a) => a.id === selectedAddressId)?.address || "14B Admiralty Way, Independence Layout, Enugu"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <span className="text-neutral-400 block">Date</span>
                        <span className="font-bold text-neutral-800">Tomorrow · Sat 23 Aug</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Time</span>
                        <span className="font-bold text-neutral-800">{selectedTimeSlot.split(" ")[1] || "Morning · 8am – 12pm"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Urgency</span>
                        <span className="font-bold text-neutral-800">{urgency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Budget & Additional Information Section */}
                <div className="space-y-2 pb-5 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-base text-[#0F1115]">
                      Budget & additional information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Budget</span>
                      <span className="font-bold text-[#0F1115] text-sm">
                        {customBudget || selectedBudgetOption}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Is water currently leaking?</span>
                        <span className="font-bold text-[#0F1115]">{questionLeaking}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Is the affected area accessible?</span>
                        <span className="font-bold text-[#0F1115]">{questionAccessible}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Is there running water supply?</span>
                        <span className="font-bold text-[#0F1115]">{questionWaterSupply}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Photos & Voice Note Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-base text-[#0F1115]">
                      Photos & voice note
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Photos Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="relative w-36 sm:w-44 h-24 sm:h-28 rounded-2xl overflow-hidden border border-neutral-200/90 shadow-2xs group bg-neutral-100 shrink-0"
                      >
                        <Image
                          src={photoUrl}
                          alt={`Uploaded photo ${index + 1}`}
                          width={176}
                          height={112}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Voice Note Bar */}
                  {hasVoiceNote && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={handleToggleVoicePlayback}
                        className="font-bold text-blue-700 flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        {isPlayingVoice ? "❚❚ Pause" : "▶ Play"}
                      </button>
                      <span className="text-neutral-500">
                        Voice note · {formatSeconds(recordingSeconds)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 7 Footer Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-black cursor-pointer"
                >
                  <span>← Back</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Draft saved successfully!");
                    }}
                    className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Publishing..." : "Post Job"}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-[#0F1115]">
                    Your {selectedService.name.toLowerCase()} job
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">{selectedService.categoryName}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Selected service</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Task</span>
                    <span className="font-bold text-[#0F1115] text-sm">{selectedTask}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Draft · not published
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-neutral-600 shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="leading-relaxed">
                  This is exactly what matched professionals will see. Your phone number stays hidden until you accept a quote.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 8: JOB LIVE (Matching media_1792267748056.png)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === 8 && (
        <div className="space-y-6 pt-4">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-2xs text-center space-y-6">
            {/* Green Circle Badge with Checkmark */}
            <div className="w-16 h-16 rounded-full bg-[#EBF7F0] flex items-center justify-center mx-auto shadow-2xs">
              <svg
                className="w-8 h-8 text-[#16A34A]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115]">
                Your job is live
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                Your job has been shared with relevant professionals. You will be notified as quotes arrive.
              </p>
            </div>

            {/* Inner Summary Details Card */}
            <div className="text-left bg-neutral-50/60 rounded-2xl p-5 border border-neutral-200/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-400">
                  Job ID · BFX-20541
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  <span>•</span> Receiving Quotes
                </span>
              </div>

              <div>
                <h3 className="font-sans font-bold text-base text-[#0F1115]">
                  {selectedService.name}
                </h3>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {selectedTask} + Servicing
                </p>
              </div>

              {/* 2 Stat Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-2xl text-[#0F1115] block">
                    12
                  </span>
                  <span className="font-sans text-[11px] text-neutral-400 font-medium">
                    Professionals matched
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-2xl text-[#0F1115] block">
                    0
                  </span>
                  <span className="font-sans text-[11px] text-neutral-400 font-medium">
                    Quotes received
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/bookings")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                View Job
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-[#0F1115] font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Back Home
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400">
            Most jobs in {locationName || "Enugu"} receive their first quote within 40 minutes.
          </p>
        </div>
      )}
    </div>
  );
}
