"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MessageItem {
  id: string;
  sender: "mentor" | "talent";
  text?: string;
  isAudio?: boolean;
  audioDuration?: string;
  time: string;
}

interface TalentMessagesViewProps {
  onBack?: () => void;
  onOpenTraining?: () => void;
  onFindMore?: () => void;
}

export function TalentMessagesView({
  onBack,
  onOpenTraining,
  onFindMore,
}: TalentMessagesViewProps) {
  const [selectedChat, setSelectedChat] = useState<string>("john");
  const [isLockedOfferOpen, setIsLockedOfferOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messagesList, setMessagesList] = useState<MessageItem[]>([
    {
      id: "m-1",
      sender: "mentor",
      text: "Good morning Daniel. Tomorrow we start gate fabrication. Come with your PPE and safety boots.",
      time: "09:12",
    },
    {
      id: "m-2",
      sender: "talent",
      text: "Good morning sir. I will be at the Emene workshop by 8:00am.",
      time: "09:15",
    },
    {
      id: "m-3",
      sender: "mentor",
      isAudio: true,
      audioDuration: "0:34",
      time: "09:20",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessagesList((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "talent",
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setNewMessage("");
  };

  // Locked Offer View (Matching Figma Screenshot 4 Top Left)
  if (isLockedOfferOpen) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16 select-none animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => setIsLockedOfferOpen(false)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Messages</span>
        </button>

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
            Apprenticeship agreement
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
            Welding & Metal Fabrication · Master artisan: John Obiora
          </p>
        </div>

        {/* Agreement Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-6 max-w-2xl mx-auto">
          {/* Header Fee Pill */}
          <div className="bg-[#001B40] rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold block">
                Programme fee
              </span>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                ₦150,000
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Accepted
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 py-1 border-b border-neutral-100">
            <span>Payment structure</span>
            <span className="font-semibold text-neutral-800">Paid in full</span>
          </div>

          {/* What's included checklist */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              What&apos;s included
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm divide-y divide-neutral-100">
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-600">Workshop tools & safety gear</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-600">Consumables for workshop</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-600">Personal PPE & boots (you supply)</span>
                <span className="font-semibold text-neutral-400">Not included</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-600">Duration</span>
                <span className="font-semibold text-neutral-800">3 months</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-600">Schedule</span>
                <span className="font-semibold text-neutral-800">Mon - Sat · 8:00am - 5:00pm</span>
              </div>
            </div>
          </div>

          {/* Locked Badge */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2 text-xs font-medium text-neutral-700">
            <span>🔒</span>
            <span>Accepted & terms locked</span>
          </div>

          <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed">
            Terms agreed and locked. Your place is held once your ₦150,000 fee is paid into escrow.
          </p>

          <button
            type="button"
            onClick={() => setIsLockedOfferOpen(false)}
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
          >
            Start conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Messages
        </h1>
      </div>

      {/* Grid: Conversations List (4 cols) & Active Chat Area (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
        {/* Left Inbox List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:border-[#001B40] focus:outline-hidden text-neutral-800 placeholder-neutral-400 transition-colors"
            />
          </div>

          {/* Conversations Items */}
          <div className="space-y-2 overflow-y-auto flex-1">
            {/* Conversation 1: John Obiora */}
            <div
              onClick={() => setSelectedChat("john")}
              className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                selectedChat === "john"
                  ? "bg-blue-50/70 border border-blue-200/80 shadow-2xs"
                  : "hover:bg-neutral-50 border border-transparent"
              }`}
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                <Image src="/images/david.jpg" alt="John Obiora" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                    John Obiora
                  </h4>
                  <span className="text-[10px] text-neutral-400">09:20</span>
                </div>
                <p className="font-sans text-xs text-neutral-500 truncate mt-0.5">
                  Voice message · 0:34
                </p>
                <span className="inline-block text-[10px] text-blue-700 bg-blue-100/60 font-semibold px-2 py-0.5 rounded mt-1">
                  Approved today: Welding joint
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
            </div>

            {/* Conversation 2: Chinedu Okafor */}
            <div
              onClick={() => setSelectedChat("chinedu")}
              className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                selectedChat === "chinedu"
                  ? "bg-blue-50/70 border border-blue-200/80 shadow-2xs"
                  : "hover:bg-neutral-50 border border-transparent"
              }`}
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                <Image src="/images/james.jpg" alt="Chinedu Okafor" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                    Chinedu Okafor
                  </h4>
                  <span className="text-[10px] text-neutral-400">Yesterday</span>
                </div>
                <p className="font-sans text-xs text-neutral-500 truncate mt-0.5">
                  The next intake for Home Electrical starts in September
                </p>
              </div>
            </div>

            {/* Conversation 3: Bluefixx Support */}
            <div
              onClick={() => setSelectedChat("support")}
              className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                selectedChat === "support"
                  ? "bg-blue-50/70 border border-blue-200/80 shadow-2xs"
                  : "hover:bg-neutral-50 border border-transparent"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                B
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                    Bluefixx Support
                  </h4>
                  <span className="text-[10px] text-neutral-400">22 Jul</span>
                </div>
                <p className="font-sans text-xs text-neutral-500 truncate mt-0.5">
                  Payment of ₦150,000 received. Your receipt is ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Active Conversation Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between overflow-hidden">
          {/* Top Chat Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between gap-4 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                <Image src="/images/david.jpg" alt="John Obiora" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
                  John Obiora
                </h3>
                <p className="font-sans text-xs text-neutral-400">
                  Master Artisan, Welding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLockedOfferOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                View agreement
              </button>
              {onOpenTraining && (
                <button
                  type="button"
                  onClick={onOpenTraining}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                >
                  Manage training &gt;
                </button>
              )}
            </div>
          </div>

          {/* Notice Banner */}
          <div className="bg-blue-50/50 border-b border-blue-100/50 px-5 py-2 text-[11px] text-blue-900 font-medium text-center">
            Your conversation is linked to your apprenticeship training and milestones
          </div>

          {/* Chat Messages Body */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {messagesList.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "talent" ? "items-end" : "items-start"
                }`}
              >
                {msg.isAudio ? (
                  /* Audio Player Bubble */
                  <div className="bg-white border border-neutral-200 shadow-xs rounded-2xl p-3.5 max-w-xs sm:max-w-sm flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-9 h-9 rounded-full bg-[#001B40] text-white flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      {isPlayingAudio ? "❚❚" : "▶"}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 text-neutral-400 text-xs">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-0.5 rounded-full inline-block transition-all ${
                              i < 10
                                ? "bg-[#001B40] h-4"
                                : "bg-neutral-300 h-2.5"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{msg.audioDuration}</span>
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Text Message Bubble */
                  <div
                    className={`max-w-xs sm:max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "talent"
                        ? "bg-[#001B40] text-white rounded-br-none"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1.5 text-right ${
                        msg.sender === "talent"
                          ? "text-blue-200"
                          : "text-neutral-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-neutral-100 flex items-center gap-3 bg-white"
          >
            <button
              type="button"
              className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              title="Attach media or project file"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 px-4 py-3 rounded-2xl bg-neutral-50/70 border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#001B40] focus:outline-hidden transition-colors"
            />

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 rounded-2xl bg-[#001B40] hover:bg-[#052F5F] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
