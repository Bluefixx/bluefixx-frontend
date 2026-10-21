"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  sender: "customer" | "artisan" | "support";
  text?: string;
  image?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  time: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialConversation = searchParams.get("conversation") === "support" ? "support" : "emeka";

  const [activeConversation, setActiveConversation] = useState<"emeka" | "support">(initialConversation);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    const conv = searchParams.get("conversation");
    if (conv === "support") {
      setActiveConversation("support");
    } else if (conv === "emeka") {
      setActiveConversation("emeka");
    }
  }, [searchParams]);

  // Messages for Emeka
  const [emekaMessages, setEmekaMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "customer",
      image: "/images/path1.png",
      text: "Water is dripping under the kitchen sink since yesterday night.",
      time: "09:12",
    },
    {
      id: "m2",
      sender: "artisan",
      text: "Good morning. From the photo, the joint under the trap has failed. I will need to replace the trap and about 2 metres of pipe. Is the mixer tap also leaking?",
      time: "09:14",
    },
    {
      id: "m3",
      sender: "customer",
      isVoice: true,
      voiceDuration: "0:24",
      time: "09:18",
    },
  ]);

  // Messages for Support
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([
    {
      id: "s1",
      sender: "support",
      text: "Hello Daniel! Bluefixx Safety & Resolution team is active 24/7. How can we support your booking BFX-20481?",
      time: "09:20",
    },
  ]);

  const currentMessages = activeConversation === "emeka" ? emekaMessages : supportMessages;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "customer",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (activeConversation === "emeka") {
      setEmekaMessages((prev) => [...prev, newMsg]);
      setInputText("");
      // Simulate quick artisan reply
      setTimeout(() => {
        setEmekaMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "artisan",
            text: "Understood! I'll include the pressure seal in the materials estimate.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    } else {
      setSupportMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setTimeout(() => {
        setSupportMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "support",
            text: "Your message has been assigned to support officer Ngozi. We are monitoring this job.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    }
  };

  const handleAttachPhoto = () => {
    const photoMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "customer",
      image: "/images/path2.png",
      text: "Additional inspection snapshot attached.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    if (activeConversation === "emeka") {
      setEmekaMessages((prev) => [...prev, photoMsg]);
    } else {
      setSupportMessages((prev) => [...prev, photoMsg]);
    }
    toast.success("Image attached");
  };

  const handleRecordVoice = () => {
    const voiceMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "customer",
      isVoice: true,
      voiceDuration: "0:18",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    if (activeConversation === "emeka") {
      setEmekaMessages((prev) => [...prev, voiceMsg]);
    } else {
      setSupportMessages((prev) => [...prev, voiceMsg]);
    }
    toast.success("Voice note recorded and sent!");
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: EMPTY STATE (Screenshot 4 Right)
  // ══════════════════════════════════════════════════════════════
  if (showEmptyState) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Messages
          </h1>
          <button
            type="button"
            onClick={() => setShowEmptyState(false)}
            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Show active chats
          </button>
        </div>

        <div className="bg-white rounded-3xl p-12 sm:p-20 border border-neutral-200/80 shadow-xs max-w-lg mx-auto flex flex-col items-center text-center mt-12 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <h2 className="font-heading font-extrabold text-xl text-[#001B40] mb-2">
            No messages yet
          </h2>

          <p className="font-sans text-xs sm:text-sm text-neutral-400 max-w-xs mb-8 leading-relaxed">
            When an artisan quotes for your job, you can chat with them here before you accept.
          </p>

          <Link
            href="/post-job"
            className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm"
          >
            + Post a job
          </Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: THREE-COLUMN MESSAGES UI (Screenshot 3 & 4)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Most recent</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowEmptyState(true)}
            className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            Simulate Empty State
          </button>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Messages
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-1">
          Booking BFX-20481 · Bathroom Plumbing Repair
        </p>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* COLUMN 1: CONVERSATIONS LIST (3 cols)                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
          <div className="px-2 pt-1">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Conversations
            </h3>
            <span className="text-[11px] text-neutral-400">
              Booking BFX-20481
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Conversation 1: Emeka Okafor */}
            <button
              type="button"
              onClick={() => setActiveConversation("emeka")}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                activeConversation === "emeka"
                  ? "bg-[#EBF1F7] border border-blue-100 shadow-2xs"
                  : "hover:bg-neutral-50"
              }`}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                <Image
                  src="/images/david.jpg"
                  alt="Emeka Okafor"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#001B40] truncate">
                  Emeka Okafor
                </h4>
                <p className="text-[11px] text-neutral-500 truncate">
                  Plumbing · Quote negotiation
                </p>
              </div>
            </button>

            {/* Conversation 2: Bluefixx Support */}
            <button
              type="button"
              onClick={() => setActiveConversation("support")}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                activeConversation === "support"
                  ? "bg-[#EBF1F7] border border-blue-100 shadow-2xs"
                  : "hover:bg-neutral-50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#001B40] text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#001B40] truncate">
                  Bluefixx Support
                </h4>
                <p className="text-[11px] text-neutral-500 truncate">
                  2 minutes to respond
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* COLUMN 2: CHAT WINDOW (6 cols)                             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col min-h-[580px] overflow-hidden">
          {/* Chat Header Bar (Dark Navy Header matching Figma) */}
          <div className="bg-[#001B40] text-white px-5 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                {activeConversation === "emeka" ? "Emeka Okafor" : "Bluefixx Support"}
              </h3>
              <p className="text-[11px] text-blue-200/80">
                {activeConversation === "emeka" ? "Plumbing · Quote negotiation" : "2 minutes to respond"}
              </p>
            </div>

            {/* Safety Button -> Opens Conversation Options Modal */}
            <button
              type="button"
              onClick={() => setIsOptionsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-white text-[#001B40] text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Safety</span>
            </button>
          </div>

          {/* Subheader info line */}
          <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Booking BFX-20481 · Bathroom Plumbing Repair</span>
            <Link
              href="/bookings"
              className="font-bold text-[#001B40] hover:underline"
            >
              View job &gt;
            </Link>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto">
            {/* Context notice */}
            <div className="text-center my-2">
              <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100/70 px-3 py-1 rounded-full">
                Conversation with {activeConversation === "emeka" ? "Emeka Okafor" : "Bluefixx Support"}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                Quick request sent · Leak &amp; burst pipe repair · Independence Layout
              </p>
            </div>

            {currentMessages.map((msg) => {
              const isMe = msg.sender === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? "bg-[#001B40] text-white rounded-tr-xs"
                        : "bg-neutral-100 text-neutral-800 rounded-tl-xs"
                    }`}
                  >
                    {/* Attached Image if present */}
                    {msg.image && (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden mb-2">
                        <Image
                          src={msg.image}
                          alt="Attachment"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Voice Note if present */}
                    {msg.isVoice ? (
                      <div className="flex items-center gap-3 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPlayingVoice(!isPlayingVoice);
                            toast(isPlayingVoice ? "Paused audio" : "Playing voice note...", { icon: "🔊" });
                          }}
                          className="w-8 h-8 rounded-full bg-white text-[#001B40] flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        >
                          {isPlayingVoice ? (
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>
                        {/* Audio Waveform Graphic */}
                        <div className="flex items-center gap-0.5 flex-1 h-5">
                          {[3, 6, 8, 4, 10, 14, 8, 12, 16, 7, 11, 15, 9, 6, 12, 8, 4, 10, 5, 8, 3].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h * 1.2}px` }}
                              className={`w-1 rounded-full ${
                                isPlayingVoice ? "bg-blue-300 animate-pulse" : "bg-white/60"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-blue-200 shrink-0 font-mono">
                          {msg.voiceDuration || "0:24"}
                        </span>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={handleAttachPhoto}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Attach photo"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* Voice Record Button */}
            <button
              type="button"
              onClick={handleRecordVoice}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Send voice note"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message"
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#001B40] transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-sm"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* COLUMN 3: BOOKING DETAILS (3 cols)                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Booking details
            </h3>
            <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
              Quote negotiation
            </span>
          </div>

          <div className="space-y-1 pt-2 border-t border-neutral-100 text-xs">
            <span className="font-bold text-neutral-800 block">
              Job report
            </span>
            <span className="text-neutral-500 block">
              Booking BFX-20481
            </span>
            <span className="text-neutral-500 block">
              Independence Layout
            </span>
          </div>

          {/* Action button */}
          <Link
            href="/bookings"
            className="block w-full py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-xs text-center transition-colors"
          >
            View job
          </Link>

          <p className="text-[11px] text-neutral-400 leading-relaxed pt-2 border-t border-neutral-100">
            Quick request sent · Leak &amp; burst pipe repair
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CONVERSATION OPTIONS MODAL (Screenshot 4 Left)               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Conversation options
              </h3>
              <button
                type="button"
                onClick={() => setIsOptionsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Option 1: Call the Police (Emergency Alert Style) */}
            <a
              href="tel:112"
              onClick={() => setIsOptionsModalOpen(false)}
              className="w-full p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 flex items-center gap-3.5 transition-colors cursor-pointer group text-left block"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-rose-600 block">
                  Call the police
                </span>
                <span className="text-[11px] text-rose-500/80">
                  Dials 112, Nigeria emergency line
                </span>
              </div>
            </a>

            {/* Option 2: Message Bluefixx Support */}
            <button
              type="button"
              onClick={() => {
                setIsOptionsModalOpen(false);
                setActiveConversation("support");
                toast.success("Switched to Bluefixx 24/7 Support chat");
              }}
              className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-neutral-800 block">
                  Message Bluefixx support
                </span>
                <span className="text-[11px] text-neutral-400">
                  Direct connection with safety agents
                </span>
              </div>
            </button>

            {/* Option 3: Share Location */}
            <button
              type="button"
              onClick={() => {
                setIsOptionsModalOpen(false);
                if (navigator.clipboard) {
                  navigator.clipboard.writeText("https://maps.google.com/?q=14+Ogui+Road+Independence+Layout+Enugu");
                }
                toast.success("Live location link copied to clipboard!");
              }}
              className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-neutral-800 block">
                  Share location
                </span>
                <span className="text-[11px] text-neutral-400">
                  Send current coordinates to artisan
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
