"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import {
  getProgramMessagesApi,
  sendProgramMessageApi,
  markTalentProgramMessagesReadApi,
  getTalentConversationsApi,
  getTalentProgramByIdApi,
} from "@/lib/api/talent";
import { TalentConversation } from "@/types/talent";
import { getSocket, emitWithAck } from "@/lib/realtime/socket";

interface MessageItem {
  id: string;
  clientId?: string;
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
  programId?: string;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatConversationTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export function TalentMessagesView({
  onBack,
  onOpenTraining,
  onFindMore,
  programId,
}: TalentMessagesViewProps) {
  const { user } = useAuth();
  const [isLockedOfferOpen, setIsLockedOfferOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [conversations, setConversations] = useState<TalentConversation[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | undefined>(programId);
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [messagesProgramId, setMessagesProgramId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Load the Talent's real programme conversations and refresh on live notifications.
  useEffect(() => {
    let isMounted = true;

    const loadConvs = () => {
      getTalentConversationsApi()
        .then(async (items) => {
          if (!isMounted) return;
          const list = Array.isArray(items) ? [...items] : [];
          if (programId && !list.some((c) => c.programId === programId)) {
            try {
              const prog = await getTalentProgramByIdApi(programId);
              if (prog && isMounted) {
                list.unshift({
                  programId: prog.id,
                  programTitle: prog.title,
                  peer: prog.artisan
                    ? {
                        id: prog.artisan.id,
                        fullName: prog.artisan.fullName,
                      }
                    : undefined,
                  unreadCount: 0,
                });
              }
            } catch {}
          }
          if (!isMounted) return;
          setConversations(list);
          setActiveProgramId((prev) => programId ?? prev ?? list[0]?.programId);
        })
        .catch(() => {
          if (isMounted) setConversations([]);
        })
        .finally(() => {
          if (isMounted) setIsLoadingConversations(false);
        });
    };

    loadConvs();

    const socket = getSocket();
    const onNotif = () => {
      if (isMounted) loadConvs();
    };
    if (socket) socket.on("notification", onNotif);

    return () => {
      isMounted = false;
      if (socket) socket.off("notification", onNotif);
    };
  }, []);

  // Load the message history for the selected conversation.
  useEffect(() => {
    if (!activeProgramId) return;
    let isMounted = true;

    getProgramMessagesApi(activeProgramId)
      .then((history) => {
        if (!isMounted) return;
        setMessagesList(
          (history ?? []).map((msg) => ({
            id: msg.id,
            sender: msg.senderId === user?.id ? "talent" : "mentor",
            text: msg.text || "",
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
        setMessagesProgramId(activeProgramId);
      })
      .catch(() => {
        if (isMounted) {
          setMessagesList([]);
          setMessagesProgramId(activeProgramId);
        }
      });

    // Mark this programme conversation as read once opened
    markTalentProgramMessagesReadApi(activeProgramId).catch(() => {
      // Non-blocking; the inbox badge simply stays until the next fetch
    });

    return () => {
      isMounted = false;
    };
  }, [activeProgramId, user?.id]);

  // Real-time Socket.IO room subscription for active talent programme conversation
  useEffect(() => {
    if (!activeProgramId || !user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const joinRoom = () => {
      emitWithAck(socket, "talent.conversation.join", {
        programId: activeProgramId,
        talentId: user.id,
      }).catch(() => {});
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const onTalentMessageCreated = (payload: { programId?: string; message?: any }) => {
      if (!payload?.message || payload.programId !== activeProgramId) return;
      const msg = payload.message;
      const mapped: MessageItem = {
        id: msg.id,
        clientId: msg.clientId,
        sender: msg.senderId === user.id ? "talent" : "mentor",
        text: msg.text || "",
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessagesList((prev) => {
        if (prev.some((item) => item.id === mapped.id)) return prev;
        if (mapped.clientId) {
          const idx = prev.findIndex((item) => item.clientId === mapped.clientId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = mapped;
            return next;
          }
        }
        return [...prev, mapped];
      });

      if (mapped.sender !== "talent") {
        markTalentProgramMessagesReadApi(activeProgramId).catch(() => {});
      }
    };

    socket.on("talent.message.created", onTalentMessageCreated);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("talent.message.created", onTalentMessageCreated);
      socket.emit("talent.conversation.leave", {
        programId: activeProgramId,
        talentId: user.id,
      });
    };
  }, [activeProgramId, user?.id]);

  const isLoadingMessages =
    activeProgramId != null && messagesProgramId !== activeProgramId;

  const activeConversation = conversations.find((c) => c.programId === activeProgramId);
  const activeName =
    activeConversation?.peer?.fullName ||
    activeConversation?.participant?.fullName ||
    activeConversation?.programTitle ||
    "Programme conversation";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProgramId) return;

    const textToSend = newMessage.trim();
    const tempId = `m-${Date.now()}`;
    const clientId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`;

    setMessagesList((prev) => [
      ...prev,
      {
        id: tempId,
        clientId,
        sender: "talent",
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setNewMessage("");

    try {
      await sendProgramMessageApi(activeProgramId, {
        clientId,
        text: textToSend,
      });
    } catch {
      toast.error("Message could not be sent. Please try again.");
    }
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
            {activeConversation?.programTitle || "Apprenticeship Programme"} · Master artisan:{" "}
            {activeConversation?.peer?.fullName || "Master Artisan"}
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
            {isLoadingConversations && (
              <div className="p-3 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl">
                Loading conversations...
              </div>
            )}

            {!isLoadingConversations && conversations.length === 0 && (
              <div className="p-3 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl">
                No programme conversations yet
              </div>
            )}

            {conversations.map((conv) => {
              const name =
                conv.peer?.fullName || conv.participant?.fullName || conv.programTitle || "Programme conversation";
              const isSelected = conv.programId === activeProgramId;
              const preview = conv.latestMessage?.text || conv.lastMessage || conv.programTitle || "Programme conversation";
              const timeStr = formatConversationTime(conv.latestMessage?.createdAt || conv.lastMessageAt);
              const unread = conv.unread ?? conv.unreadCount ?? 0;
              return (
                <button
                  key={conv.programId}
                  type="button"
                  onClick={() => setActiveProgramId(conv.programId)}
                  className={`w-full p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                    isSelected
                      ? "bg-blue-50/70 border border-blue-200/80 shadow-2xs"
                      : "hover:bg-neutral-50 border border-transparent"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#001B40] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
                    <span>{initialsOf(name) || "B"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                        {name}
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {timeStr}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-neutral-500 truncate mt-0.5">
                      {preview}
                    </p>
                  </div>
                  {unread > 0 && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between overflow-hidden">
          {/* Top Chat Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between gap-4 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#001B40] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
                <span>{initialsOf(activeName) || "B"}</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
                  {activeName}
                </h3>
                <p className="font-sans text-xs text-neutral-400">
                  {activeConversation?.programTitle || "Programme conversation"}
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
            {isLoadingMessages && (
              <div className="py-12 text-center text-xs text-neutral-400">
                Loading messages...
              </div>
            )}

            {!isLoadingMessages && messagesList.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400">
                <p className="font-semibold text-neutral-700">No messages yet</p>
                <p className="text-neutral-400 mt-1">
                  Send a message below to start the conversation.
                </p>
              </div>
            )}

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
