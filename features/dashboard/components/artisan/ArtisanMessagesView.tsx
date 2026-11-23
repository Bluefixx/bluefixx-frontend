"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import {
  getConversationsApi,
  getQuoteMessagesApi,
  sendQuoteMessageApi,
  markQuoteMessagesReadApi,
} from "@/lib/api/messages";
import {
  getTalentConversationsApi,
  getProgramMessagesApi,
  sendProgramMessageApi,
  markTalentProgramMessagesReadApi,
} from "@/lib/api/talent";
import { getSocket, emitWithAck } from "@/lib/realtime/socket";
import { LiveNegotiationPanel } from "@/features/dashboard/components/LiveNegotiationPanel";

type ThreadKind = "quote" | "talent" | "support";

interface ArtisanThread {
  key: string;
  kind: ThreadKind;
  quoteId?: string;
  programId?: string;
  talentId?: string;
  peerName: string;
  subtitle: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ArtisanMessage {
  id: string;
  clientId?: string;
  sender: "peer" | "artisan" | "support";
  senderName: string;
  text: string;
  time: string;
}

interface ArtisanMessagesViewProps {
  onBackToDashboard?: () => void;
}

function formatShortTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ArtisanMessagesView({ onBackToDashboard: _onBackToDashboard }: ArtisanMessagesViewProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestedQuoteId = searchParams.get("quoteId");
  const [threads, setThreads] = useState<ArtisanThread[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingJobBooking, setViewingJobBooking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<ArtisanMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, selectedKey]);

  // Load real quote + talent programme conversations
  useEffect(() => {
    let mounted = true;
    const loadThreads = () => {
      Promise.allSettled([getConversationsApi(), getTalentConversationsApi()]).then(
        ([quoteRes, talentRes]) => {
          if (!mounted) return;
          const list: ArtisanThread[] = [];

          if (quoteRes.status === "fulfilled" && Array.isArray(quoteRes.value)) {
            for (const c of quoteRes.value) {
              list.push({
                key: `quote:${c.quoteId}`,
                kind: "quote",
                quoteId: c.quoteId,
                peerName: c.peer?.fullName || "Customer",
                subtitle: `Quote with ${c.peer?.fullName || "Customer"}`,
                lastMessage: c.latestMessage?.text || "Quote conversation",
                time: formatShortTime(c.latestMessage?.createdAt),
                unread: c.unread || 0,
              });
            }
          }

          if (talentRes.status === "fulfilled" && Array.isArray(talentRes.value)) {
            for (const t of talentRes.value) {
              const tId = t.talentId || t.peer?.id || t.participant?.id;
              list.push({
                key: `talent:${t.programId}:${tId || "all"}`,
                kind: "talent",
                programId: t.programId,
                talentId: tId,
                peerName: t.peer?.fullName || t.participant?.fullName || t.programTitle || "Talent Apprentice",
                subtitle: t.programTitle || "Apprenticeship Programme",
                lastMessage: t.latestMessage?.text || t.lastMessage || "Programme conversation",
                time: formatShortTime(t.latestMessage?.createdAt || t.lastMessageAt),
                unread: t.unread ?? t.unreadCount ?? 0,
              });
            }
          }

          list.push({
            key: "support",
            kind: "support",
            peerName: "BlueFixx Support",
            subtitle: "Official BlueFixx Safety & Support",
            lastMessage: "24/7 Safety & Assistance",
            time: "",
            unread: 0,
          });

          setThreads(list);
          if (requestedQuoteId && list.some((t) => t.key === `quote:${requestedQuoteId}`)) {
            setSelectedKey(`quote:${requestedQuoteId}`);
          } else {
            setSelectedKey((prev) => prev ?? list[0]?.key ?? "support");
          }
          setIsLoadingThreads(false);
        }
      );
    };

    loadThreads();

    const socket = getSocket();
    const onNotif = () => {
      if (mounted) loadThreads();
    };
    if (socket) {
      socket.on("notification", onNotif);
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.off("notification", onNotif);
      }
    };
  }, [requestedQuoteId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.key === selectedKey) ?? null,
    [threads, selectedKey]
  );

  // Load message history for selected thread
  useEffect(() => {
    if (!activeThread || !user?.id) return;
    let mounted = true;

    if (activeThread.kind === "support") {
      setChatMessages([
        {
          id: "support-welcome",
          sender: "support",
          senderName: "BlueFixx Support",
          text: `Hello ${user.fullName ? user.fullName.split(" ")[0] : ""}! BlueFixx Safety & Resolution team is active 24/7.`,
          time: "Just now",
        },
      ]);
      return;
    }

    if (activeThread.kind === "quote" && activeThread.quoteId) {
      const qId = activeThread.quoteId;
      getQuoteMessagesApi(qId)
        .then((msgs) => {
          if (!mounted) return;
          const sorted = [...(msgs ?? [])].sort(
            (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );
          const mapped: ArtisanMessage[] = sorted.map((m: any) => {
            const isSelf = m.senderId === user.id || m.authorId === user.id;
            return {
              id: m.id,
              clientId: m.clientId,
              sender: isSelf ? "artisan" : "peer",
              senderName: isSelf ? (user.fullName || "You") : activeThread.peerName,
              text: m.text || "",
              time: formatShortTime(m.createdAt) || "Today",
            };
          });
          setChatMessages(mapped);
          markQuoteMessagesReadApi(qId).catch(() => {});
        })
        .catch(() => {
          if (mounted) setChatMessages([]);
        });
    } else if (activeThread.kind === "talent" && activeThread.programId) {
      const pId = activeThread.programId;
      const tId = activeThread.talentId;
      getProgramMessagesApi(pId, { talentId: tId })
        .then((msgs) => {
          if (!mounted) return;
          const sorted = [...(msgs ?? [])].sort(
            (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );
          const mapped: ArtisanMessage[] = sorted.map((m) => {
            const isSelf = m.senderId === user.id;
            return {
              id: m.id,
              clientId: (m as { clientId?: string }).clientId,
              sender: isSelf ? "artisan" : "peer",
              senderName: isSelf ? (user.fullName || "You") : activeThread.peerName,
              text: m.text || "",
              time: formatShortTime(m.createdAt) || "Today",
            };
          });
          setChatMessages(mapped);
          markTalentProgramMessagesReadApi(pId, { talentId: tId }).catch(() => {});
        })
        .catch(() => {
          if (mounted) setChatMessages([]);
        });
    }

    return () => {
      mounted = false;
    };
  }, [activeThread, user?.id, user?.fullName]);

  // Real-time Socket.IO room subscription for active thread
  useEffect(() => {
    if (!activeThread || activeThread.kind === "support" || !user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    if (activeThread.kind === "quote" && activeThread.quoteId) {
      const qId = activeThread.quoteId;
      const joinRoom = () => {
        emitWithAck(socket, "conversation.join", { quoteId: qId }).catch(() => {});
      };
      if (socket.connected) joinRoom();
      socket.on("connect", joinRoom);

      const onMessageCreated = (payload: { quoteId?: string; message?: any }) => {
        if (!payload?.message || payload.quoteId !== qId) return;
        const m = payload.message;
        const isSelf = m.senderId === user.id || m.authorId === user.id;
        const mapped: ArtisanMessage = {
          id: m.id,
          clientId: m.clientId,
          sender: isSelf ? "artisan" : "peer",
          senderName: isSelf ? (user.fullName || "You") : activeThread.peerName,
          text: m.text || "",
          time: formatShortTime(m.createdAt) || formatShortTime(new Date().toISOString()),
        };
        setChatMessages((prev) => {
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
        setThreads((prev) =>
          prev.map((t) =>
            t.key === activeThread.key
              ? { ...t, lastMessage: mapped.text, time: mapped.time }
              : t
          )
        );
        if (mapped.sender !== "artisan") {
          markQuoteMessagesReadApi(qId).catch(() => {});
        }
      };

      socket.on("message.created", onMessageCreated);
      return () => {
        socket.off("connect", joinRoom);
        socket.off("message.created", onMessageCreated);
        socket.emit("conversation.leave", { quoteId: qId });
      };
    }

    if (activeThread.kind === "talent" && activeThread.programId && activeThread.talentId) {
      const pId = activeThread.programId;
      const tId = activeThread.talentId;
      const joinRoom = () => {
        emitWithAck(socket, "talent.conversation.join", {
          programId: pId,
          talentId: tId,
        }).catch(() => {});
      };
      if (socket.connected) joinRoom();
      socket.on("connect", joinRoom);

      const onTalentMessageCreated = (payload: { programId?: string; message?: any }) => {
        if (!payload?.message || payload.programId !== pId) return;
        const m = payload.message;
        const isSelf = m.senderId === user.id;
        const mapped: ArtisanMessage = {
          id: m.id,
          clientId: m.clientId,
          sender: isSelf ? "artisan" : "peer",
          senderName: isSelf ? (user.fullName || "You") : activeThread.peerName,
          text: m.text || "",
          time: formatShortTime(m.createdAt) || formatShortTime(new Date().toISOString()),
        };
        setChatMessages((prev) => {
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
        setThreads((prev) =>
          prev.map((t) =>
            t.key === activeThread.key
              ? { ...t, lastMessage: mapped.text, time: mapped.time }
              : t
          )
        );
        if (mapped.sender !== "artisan") {
          markTalentProgramMessagesReadApi(pId, { talentId: tId }).catch(() => {});
        }
      };

      socket.on("talent.message.created", onTalentMessageCreated);
      return () => {
        socket.off("connect", joinRoom);
        socket.off("talent.message.created", onTalentMessageCreated);
        socket.emit("talent.conversation.leave", { programId: pId, talentId: tId });
      };
    }
  }, [activeThread, user?.id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeThread) return;
    const textToSend = inputText.trim();
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Date.now()}`;

    const newMsg: ArtisanMessage = {
      id: clientId,
      clientId,
      sender: "artisan",
      senderName: user?.fullName || "You",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setThreads((prev) =>
      prev.map((t) =>
        t.key === activeThread.key
          ? { ...t, lastMessage: textToSend, time: newMsg.time }
          : t
      )
    );

    if (activeThread.kind === "quote" && activeThread.quoteId) {
      const socket = getSocket();
      if (socket?.connected) {
        emitWithAck(socket, "message.send", {
          quoteId: activeThread.quoteId,
          message: { text: textToSend, mediaIds: [], clientId },
        }).catch(() => {
          sendQuoteMessageApi(activeThread.quoteId!, { text: textToSend, clientId }).catch(() => {
            toast.error("Message could not be sent.");
          });
        });
      } else {
        sendQuoteMessageApi(activeThread.quoteId, { text: textToSend, clientId }).catch(() => {
          toast.error("Message could not be sent.");
        });
      }
    } else if (activeThread.kind === "talent" && activeThread.programId) {
      sendProgramMessageApi(activeThread.programId, {
        text: textToSend,
        clientId,
      }).catch(() => {
        toast.error("Message could not be sent.");
      });
    } else if (activeThread.kind === "support") {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `sup-${Date.now()}`,
            sender: "support",
            senderName: "BlueFixx Support",
            text: "Thank you for contacting BlueFixx Support. An agent will follow up shortly.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1000);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.peerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    t.subtitle.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

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
      {/* Top Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200/80 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#001B40]">
            Messages
          </h1>
          {activeThread && activeThread.kind !== "support" && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl bg-neutral-100 text-[11px] font-semibold text-neutral-700">
              {activeThread.kind === "quote" ? "Quote Chat" : "Talent Programme Chat"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedKey(selectedKey ? null : threads[0]?.key ?? null)}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          {selectedKey ? "Deselect" : "Select conversation"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CONVERSATION LIST */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {isLoadingThreads && (
              <div className="p-4 text-xs text-neutral-400">Loading conversations...</div>
            )}
            {filteredThreads.map((thread) => {
              const isSelected = thread.key === selectedKey;
              const initial = thread.peerName.charAt(0).toUpperCase() || "B";
              return (
                <button
                  key={thread.key}
                  type="button"
                  onClick={() => setSelectedKey(thread.key)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isSelected ? "bg-[#EBF1F7]/70" : "hover:bg-neutral-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                      thread.kind === "support"
                        ? "bg-[#001B40] text-white"
                        : thread.kind === "talent"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-blue-100 text-blue-900"
                    }`}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] truncate">
                        {thread.peerName}
                      </span>
                      <span className="text-[11px] text-neutral-400 shrink-0">{thread.time}</span>
                    </div>
                    <p className="text-xs text-neutral-600 truncate">{thread.lastMessage}</p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{thread.subtitle}</p>
                  </div>
                  {thread.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {thread.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PANE OR EMPTY STATE */}
        <div className="flex-1 bg-neutral-50 flex flex-col overflow-hidden">
          {!activeThread ? (
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
                Chats with customers and talents are linked to your quotes and programmes.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-white">
              {/* Chat Top Bar */}
              <div className="p-4 border-b border-neutral-200/80 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                    {activeThread.peerName.charAt(0).toUpperCase() || "B"}
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      {activeThread.peerName}
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      {activeThread.subtitle}
                    </p>
                  </div>
                </div>

                {activeThread.kind === "quote" && (
                  <button
                    type="button"
                    onClick={() => setViewingJobBooking(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100"
                  >
                    <span>{activeThread.subtitle}</span>
                    <span className="text-blue-800 font-extrabold">View job →</span>
                  </button>
                )}
              </div>

              {/* Chat Messages Timeline */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-neutral-50/50">
                {activeThread.kind === "quote" && activeThread.quoteId && (
                  <LiveNegotiationPanel
                    quoteId={activeThread.quoteId}
                    role="ARTISAN"
                  />
                )}
                <div className="flex justify-center">
                  <span className="text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200/80 px-3.5 py-1 rounded-full shadow-2xs">
                    {activeThread.subtitle}
                  </span>
                </div>

                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "artisan" ? "items-end ml-auto max-w-lg" : "items-start max-w-lg"
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-neutral-500 mb-1 px-1">
                      {m.senderName}
                    </span>
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
                <div ref={messagesEndRef} />
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

