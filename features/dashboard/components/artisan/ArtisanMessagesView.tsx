"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type ConversationType = "chiamaka" | "fatima" | "support" | null;
type ConversationMode = "booking" | "quote";

interface ArtisanMessagesViewProps {
  onBackToDashboard?: () => void;
}

export function ArtisanMessagesView({ onBackToDashboard }: ArtisanMessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<ConversationType>("chiamaka");
  const [conversationMode, setConversationMode] = useState<ConversationMode>("booking");
  const [viewingJobBooking, setViewingJobBooking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // New message sender simulation
  const [chatMessages, setChatMessages] = useState([
    {
      id: "msg-1",
      sender: "customer",
      text: "Good morning, are you still able to come today? The leak is getting worse.",
      time: "09:10",
      isVoice: false,
    },
    {
      id: "msg-2",
      sender: "artisan",
      text: "Yes, I have just finished my previous job and I am setting off now. I should be there by 10:30.",
      time: "09:12",
      isVoice: false,
    },
    {
      id: "msg-3",
      sender: "customer",
      time: "09:14",
      isVoice: true,
      duration: "0:24",
    },
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "artisan" as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: false,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputText("");
    toast.success("Message sent");
  };

  const toggleVoicePlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      toast("Playing voice note...", { icon: "🔊" });
    }
  };

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW: JOB BOOKING DETAIL (Screenshot 4 Right)
  // ═══════════════════════════════════════════════════════════
  if (viewingJobBooking) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setViewingJobBooking(false)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Messages</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            Job booking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
            Booking #BF-304 · Leak repair · Chiamaka Obi
          </p>
        </div>

        {/* Elevated Booking Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm">
          {/* Dark Blue Header */}
          <div className="bg-[#001B40] text-white px-6 sm:px-8 py-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-300 font-medium block">Offer</span>
              <span className="text-2xl sm:text-3xl font-heading font-extrabold">₦43,500</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
              Closed
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Labour */}
            <div className="flex items-center justify-between text-xs sm:text-sm pb-4 border-b border-neutral-100">
              <span className="text-neutral-600 font-medium">Labour</span>
              <span className="font-heading font-bold text-[#0F1115]">₦24,000</span>
            </div>

            {/* Materials */}
            <div className="space-y-3 pb-4 border-b border-neutral-100">
              <span className="text-xs sm:text-sm text-neutral-600 font-medium block">Materials</span>
              <div className="flex items-center justify-between text-xs pl-3">
                <span className="text-neutral-700">
                  PPR pipe & fittings (2m) <span className="text-neutral-400 font-normal">(You supply)</span>
                </span>
                <span className="font-heading font-bold text-[#0F1115]">₦6,500</span>
              </div>
              <div className="flex items-center justify-between text-xs pl-3">
                <span className="text-neutral-700">
                  Mixer tap replacement <span className="text-neutral-400 font-normal">(Customer supplies - not in quote)</span>
                </span>
                <span className="font-heading font-bold text-[#0F1115]">₦13,000</span>
              </div>
            </div>

            {/* Warranty */}
            <div className="flex items-center justify-between text-xs sm:text-sm pb-4 border-b border-neutral-100">
              <span className="text-neutral-600 font-medium">Warranty</span>
              <span className="font-heading font-bold text-[#0F1115]">3 months</span>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between text-xs sm:text-sm pb-4 border-b border-neutral-100">
              <span className="text-neutral-600 font-medium">Timeline</span>
              <span className="font-heading font-bold text-[#0F1115]">1 working day</span>
            </div>

            {/* Green Terms Locked Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs font-bold text-emerald-800">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Accepted, terms locked</span>
            </div>
          </div>
        </div>

        {/* Footer Note & Button */}
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Terms are locked. Chiamaka pays deposit into escrow before you start, and we will notify you when it arrives.
          </p>

          <button
            type="button"
            onClick={() => setViewingJobBooking(false)}
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            Back to conversation
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN INBOX & CONVERSATION PANE
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Header & Simulation Controls */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200/80 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#001B40]">
            Messages
          </h1>
          {selectedConversation === "chiamaka" && (
            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-[11px] font-semibold text-neutral-600">
              <button
                type="button"
                onClick={() => setConversationMode("booking")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  conversationMode === "booking" ? "bg-white text-[#001B40] shadow-2xs font-bold" : "hover:text-neutral-900"
                }`}
              >
                Booking Chat
              </button>
              <button
                type="button"
                onClick={() => setConversationMode("quote")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  conversationMode === "quote" ? "bg-white text-[#001B40] shadow-2xs font-bold" : "hover:text-neutral-900"
                }`}
              >
                Quote Chat
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedConversation(null)}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          {selectedConversation ? "Deselect" : "Select Chiamaka"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CONVERSATION LIST (Screenshot 3 Left) */}
        <div className="w-full sm:w-80 md:w-96 border-r border-neutral-200/80 bg-white flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3.5 border-b border-neutral-100">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-3 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {/* Conversation 1: Chiamaka Obi */}
            <button
              type="button"
              onClick={() => setSelectedConversation("chiamaka")}
              className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                selectedConversation === "chiamaka" ? "bg-[#EBF1F7]/70" : "hover:bg-neutral-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                  👩
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-heading font-extrabold text-xs sm:text-sm text-[#0F1115] truncate">
                    Chiamaka Obi
                  </span>
                  <span className="text-[11px] text-neutral-400 shrink-0">09:14</span>
                </div>
                <p className="text-xs font-semibold text-[#001B40] truncate flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  <span>Voice message · 0:17</span>
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  Booking #BF-304 · Leak repair
                </p>
              </div>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                1
              </span>
            </button>

            {/* Conversation 2: Fatima Bello */}
            <button
              type="button"
              onClick={() => {
                setSelectedConversation("fatima");
                setConversationMode("quote");
              }}
              className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                selectedConversation === "fatima" ? "bg-[#EBF1F7]/70" : "hover:bg-neutral-50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold text-sm flex items-center justify-center shrink-0">
                F
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                    Fatima Bello
                  </span>
                  <span className="text-[11px] text-neutral-400 shrink-0">Yesterday</span>
                </div>
                <p className="text-xs text-neutral-600 truncate">
                  Can the quote include the DB board too?
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  Quote request · Electrical
                </p>
              </div>
            </button>

            {/* Conversation 3: BlueFixx Support */}
            <button
              type="button"
              onClick={() => setSelectedConversation("support")}
              className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                selectedConversation === "support" ? "bg-[#EBF1F7]/70" : "hover:bg-neutral-50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#001B40] text-white font-bold text-sm flex items-center justify-center shrink-0">
                B
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                    BlueFixx Support
                  </span>
                  <span className="text-[11px] text-neutral-400 shrink-0">22 Jul</span>
                </div>
                <p className="text-xs text-neutral-600 truncate">
                  Payout for #BF-2785 has been released.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PANE OR EMPTY STATE */}
        <div className="flex-1 bg-neutral-50 flex flex-col overflow-hidden">
          {!selectedConversation ? (
            /* EMPTY STATE: SELECT A CONVERSATION (Screenshot 3 Left) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center text-neutral-400 mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115] mb-1.5">
                Select a conversation
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Chats with customers are linked to their jobs so quotes, bookings and payments stay in one place.
              </p>
            </div>
          ) : (
            /* ACTIVE CHAT WORKBENCH */
            <div className="flex-1 flex flex-col h-full bg-white">
              {/* Chat Top Bar */}
              <div className="p-4 border-b border-neutral-200/80 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                      {selectedConversation === "chiamaka" ? "👩" : selectedConversation === "fatima" ? "F" : "B"}
                    </div>
                    {selectedConversation === "chiamaka" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      {selectedConversation === "chiamaka"
                        ? "Chiamaka Obi"
                        : selectedConversation === "fatima"
                        ? "Fatima Bello"
                        : "BlueFixx Support"}
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      {selectedConversation === "chiamaka"
                        ? "Online"
                        : selectedConversation === "fatima"
                        ? "Active 2h ago"
                        : "Official BlueFixx Safety & Support"}
                    </p>
                  </div>
                </div>

                {/* Job Link in Header */}
                {selectedConversation === "chiamaka" && (
                  <button
                    type="button"
                    onClick={() => setViewingJobBooking(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100"
                  >
                    <span>
                      {conversationMode === "booking"
                        ? "Booking #BF-304 · Leak repair"
                        : "Quote request · Independence Layout"}
                    </span>
                    <span className="text-blue-800 font-extrabold">View job →</span>
                  </button>
                )}
              </div>

              {/* Chat Messages Timeline */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-neutral-50/50">
                {/* System Divider Pill */}
                <div className="flex justify-center">
                  <span className="text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200/80 px-3.5 py-1 rounded-full shadow-2xs">
                    {conversationMode === "booking"
                      ? "This conversation is linked to Booking #BF-304"
                      : "Quote request sent · Leak & burst pipe repair"}
                  </span>
                </div>

                {/* Quote Mode: Customer Photo Preview (Screenshot 4 Left) */}
                {conversationMode === "quote" && (
                  <div className="max-w-md bg-white rounded-2xl p-3 border border-neutral-200 shadow-2xs space-y-2">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-100">
                      <Image
                        src="/images/path1.png"
                        alt="Pipe leak photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      Water has been dripping under the kitchen sink since last night.
                    </p>
                    <span className="text-[10px] text-neutral-400 block text-right">09:08</span>
                  </div>
                )}

                {/* Message 1: Customer */}
                <div className="flex flex-col items-start max-w-lg">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-neutral-200 shadow-2xs text-xs sm:text-sm text-neutral-800 leading-relaxed">
                    {conversationMode === "booking"
                      ? "Good morning, are you still able to come today? The leak is getting worse."
                      : "Could you please give me an estimate for fixing this as soon as possible?"}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 pl-1">09:10</span>
                </div>

                {/* Message 2: Artisan (Blue Bubble) */}
                <div className="flex flex-col items-end ml-auto max-w-lg">
                  <div className="bg-[#001B40] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-2xs text-xs sm:text-sm leading-relaxed">
                    {conversationMode === "booking"
                      ? "Yes, I have just finished my previous job and I am setting off now. I should be there by 10:30."
                      : "Good morning, from the photo the joint under the trap has failed. I will need to replace the trap and about 2 metres of pipe. Is the mixer tap also leaking?"}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 pr-1">09:12</span>
                </div>

                {/* Message 3: Customer Voice Note */}
                <div className="flex flex-col items-start max-w-xs">
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 border border-neutral-200 shadow-2xs flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleVoicePlayback}
                      className="w-9 h-9 rounded-full bg-blue-50 text-[#001B40] flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                    >
                      {isPlayingAudio ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>

                    {/* Waveform bars */}
                    <div className="flex items-center gap-1 flex-1">
                      {[12, 24, 16, 32, 20, 14, 28, 18, 10, 22, 16, 26, 14, 8].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-full transition-all ${
                            isPlayingAudio && i < 6 ? "bg-[#001B40]" : "bg-neutral-300"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] font-bold text-neutral-500 shrink-0">0:24</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 pl-1">09:14</span>
                </div>

                {/* Dynamically appended messages */}
                {chatMessages.slice(3).map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "artisan" ? "items-end ml-auto max-w-lg" : "items-start max-w-lg"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === "artisan"
                          ? "bg-[#001B40] text-white rounded-tr-sm shadow-2xs"
                          : "bg-white text-neutral-800 rounded-tl-sm border border-neutral-200 shadow-2xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Message Input Bar */}
              <div className="p-3 sm:p-4 border-t border-neutral-200/80 bg-white flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toast("Photo / file attachment triggered", { icon: "📎" })}
                  className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Attach file"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => toast("Recording voice note...", { icon: "🎙️" })}
                  className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Record voice note"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Write a message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="p-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ArtisanMessagesView;

