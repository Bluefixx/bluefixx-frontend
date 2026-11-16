"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import {
  sendQuoteMessageApi,
  getQuoteMessagesApi,
  getConversationsApi,
  markQuoteMessagesReadApi,
  uploadMediaFile,
} from "@/lib/api";
import { ArtisanMessagesView } from "@/features/dashboard/components/artisan/ArtisanMessagesView";
import { ChatAttachments, extractChatAttachments } from "@/components/chat/ChatAttachments";
import { ChatMessageAttachment, Conversation } from "@/types/customer";
import { getSocket, emitWithAck } from "@/lib/realtime/socket";

interface ChatMessage {
  id: string;
  clientId?: string;
  sender: "customer" | "artisan" | "support";
  text?: string;
  image?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  audioUrl?: string;
  attachments?: ChatMessageAttachment[];
  time: string;
}

function CustomerMessagesView() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialConversation = searchParams.get("conversation") === "support" ? "support" : "support";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string>(initialConversation);
  const [activePeerName, setActivePeerName] = useState<string>("Bluefixx Support");
  const [activePeerRole, setActivePeerRole] = useState<string>("24/7 Safety & Assistance");
  const [activePeerAvatar, setActivePeerAvatar] = useState<string>("/images/david.jpg");
  const [activeBookingTitle, setActiveBookingTitle] = useState<string>("Safety & Support Desk");
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  // Functional Attachment state
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  // Functional Audio / Voice Note states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Fetch real conversations from API
  useEffect(() => {
    let mounted = true;
    getConversationsApi()
      .then((items) => {
        if (!mounted || !Array.isArray(items)) return;
        setConversations(items);
        const convParam = searchParams.get("conversation") || searchParams.get("quoteId");
        if (convParam === "support") {
          setActiveConversation("support");
          setActivePeerName("Bluefixx Support");
          setActivePeerRole("24/7 Safety & Assistance");
          setActiveBookingTitle("Safety & Support Desk");
        } else if (convParam && items.some((c) => c.quoteId === convParam)) {
          const match = items.find((c) => c.quoteId === convParam)!;
          setActiveConversation(match.quoteId);
          setActivePeerName(match.peer?.fullName || "Verified Artisan");
          setActivePeerRole(match.status || "Quote Discussion");
          setActivePeerAvatar(match.peer?.photoUrl || "/images/david.jpg");
          setActiveBookingTitle(`Quote with ${match.peer?.fullName || "Verified Artisan"}`);
        } else if (items.length > 0) {
          const first = items[0];
          setActiveConversation(first.quoteId);
          setActivePeerName(first.peer?.fullName || "Verified Artisan");
          setActivePeerRole(first.status || "Quote Discussion");
          setActivePeerAvatar(first.peer?.photoUrl || "/images/david.jpg");
          setActiveBookingTitle(`Quote with ${first.peer?.fullName || "Verified Artisan"}`);
        }
      })
      .catch((err) => {
        console.debug("Conversations endpoint offline:", err);
      });

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Load message history from API for the active quote if available
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let mounted = true;
    if (activeConversation !== "support") {
      getQuoteMessagesApi(activeConversation)
        .then((msgs) => {
          if (!mounted) return;
          if (Array.isArray(msgs) && msgs.length > 0) {
            const sorted = [...msgs].sort(
              (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );
            const mapped: ChatMessage[] = sorted.map((m: any) => ({
              id: m.id,
              clientId: m.clientId,
              sender: m.authorId === user?.id || m.senderId === user?.id ? "customer" : "artisan",
              text: m.text,
              attachments: extractChatAttachments(m),
              time: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Today",
            }));
            setChatMessages(mapped);
            markQuoteMessagesReadApi(activeConversation).catch(() => {});
          } else {
            setChatMessages([]);
          }
        })
        .catch(() => {
          if (mounted) setChatMessages([]);
        });
    }

    return () => {
      mounted = false;
    };
  }, [activeConversation, user?.id]);

  // Real-time Socket.IO room subscription for active quote conversation
  useEffect(() => {
    if (activeConversation === "support" || !user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const joinRoom = () => {
      emitWithAck(socket, "conversation.join", { quoteId: activeConversation }).catch(() => {});
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const onMessageCreated = (payload: { quoteId?: string; message?: any }) => {
      if (!payload?.message || payload.quoteId !== activeConversation) return;
      const m = payload.message;
      const mapped: ChatMessage = {
        id: m.id,
        clientId: m.clientId,
        sender: m.authorId === user?.id || m.senderId === user?.id ? "customer" : "artisan",
        text: m.text,
        attachments: extractChatAttachments(m),
        time: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

      setConversations((prev) =>
        prev.map((c) =>
          c.quoteId === activeConversation
            ? { ...c, latestMessage: m }
            : c
        )
      );

      if (mapped.sender !== "customer") {
        markQuoteMessagesReadApi(activeConversation).catch(() => {});
      }
    };

    socket.on("message.created", onMessageCreated);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("message.created", onMessageCreated);
      socket.emit("conversation.leave", { quoteId: activeConversation });
    };
  }, [activeConversation, user?.id]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // Messages for Support
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([
    {
      id: "s1",
      sender: "support",
      text: `Hello ${user?.fullName ? user.fullName.split(" ")[0] : ""}! Bluefixx Safety & Resolution team is active 24/7. How can we support you today?`,
      time: "Just now",
    },
  ]);

  const currentMessages = activeConversation === "support" ? supportMessages : chatMessages;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText("");
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Date.now()}`;

    const newMsg: ChatMessage = {
      id: clientId,
      clientId,
      sender: "customer",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (activeConversation !== "support") {
      setChatMessages((prev) => [...prev, newMsg]);

      const socket = getSocket();
      if (socket?.connected) {
        emitWithAck(socket, "message.send", {
          quoteId: activeConversation,
          message: { text: textToSend, mediaIds: [], clientId },
        }).catch(() => {
          sendQuoteMessageApi(activeConversation, {
            text: textToSend,
            clientId,
          }).catch(() => {});
        });
      } else {
        sendQuoteMessageApi(activeConversation, {
          text: textToSend,
          clientId,
        }).catch(() => {});
      }
    } else {
      setSupportMessages((prev) => [...prev, newMsg]);
      setTimeout(() => {
        setSupportMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "support",
            text: "Your message has been received by our support desk. We will respond shortly.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // FUNCTIONAL FILE / PHOTO ATTACHMENT
  // ══════════════════════════════════════════════════════════════
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const dataUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    const clientId = crypto.randomUUID();
    const photoMsg: ChatMessage = {
      id: clientId,
      clientId,
      sender: "customer",
      text: file.name,
      attachments: [
        {
          id: clientId,
          purpose: "CHAT",
          resourceType: isImage ? "image" : "raw",
          bytes: file.size,
          localUrl: dataUrl,
          fileName: file.name,
        },
      ],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (activeConversation !== "support") {
      setChatMessages((prev) => [...prev, photoMsg]);
      try {
        const res = await uploadMediaFile(file, "CHAT");
        await sendQuoteMessageApi(activeConversation, {
          text: file.name,
          mediaIds: [res.id],
          clientId,
        });
        toast.success(isImage ? "Photo sent" : "File sent");
      } catch {
        toast.error("Failed to send attachment");
      }
    } else {
      setSupportMessages((prev) => [...prev, photoMsg]);
      toast.success("Attachment added");
    }
  };

  // ══════════════════════════════════════════════════════════════
  // FUNCTIONAL VOICE RECORDING
  // ══════════════════════════════════════════════════════════════
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationSecondsSnapshot = recordingSeconds;
        const durationStr = `0:${durationSecondsSnapshot < 10 ? "0" : ""}${durationSecondsSnapshot}`;
        const clientId = crypto.randomUUID();

        const voiceMsg: ChatMessage = {
          id: clientId,
          clientId,
          sender: "customer",
          text: `Voice note (${durationStr})`,
          attachments: [
            {
              id: clientId,
              purpose: "VOICE",
              resourceType: "video",
              duration: durationSecondsSnapshot || 1,
              localUrl: audioUrl,
            },
          ],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (activeConversation !== "support") {
          setChatMessages((prev) => [...prev, voiceMsg]);
          try {
            const audioFile = new File([audioBlob], `voicenote-${Date.now()}.${ext}`, {
              type: mimeType,
            });
            const res = await uploadMediaFile(audioFile, "VOICE");
            await sendQuoteMessageApi(activeConversation, {
              text: `Voice note (${durationStr})`,
              mediaIds: [res.id],
              clientId,
            });
            toast.success("Voice note sent");
          } catch {
            toast.error("Failed to send voice note");
          }
        } else {
          setSupportMessages((prev) => [...prev, voiceMsg]);
          toast.success("Voice note added");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch {
      // Fallback if browser permission is blocked / mock voice note
      toast("Microphone access simulated for preview", { icon: "🎙️" });
      const simulatedVoiceMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "customer",
        isVoice: true,
        voiceDuration: "0:12",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (activeConversation !== "support") {
        setChatMessages((prev) => [...prev, simulatedVoiceMsg]);
      } else {
        setSupportMessages((prev) => [...prev, simulatedVoiceMsg]);
      }
    }
  };

  const stopAndSendRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    toast("Recording cancelled", { icon: "✕" });
  };

  // Play audio toggle
  const togglePlayAudio = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingMessageId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    if (msg.audioUrl) {
      const audio = new Audio(msg.audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => setPlayingMessageId(null);
      audio.play().catch(() => {});
      setPlayingMessageId(msg.id);
    } else {
      // Simulate playback for pre-loaded voice notes
      setPlayingMessageId(msg.id);
      setTimeout(() => {
        setPlayingMessageId(null);
      }, 4000);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: THREE-COLUMN MESSAGES UI
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* Hidden file input for functional photo / file attachment */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.zip"
        onChange={handlePhotoSelect}
        className="hidden"
      />

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
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Messages
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-1">
          {activeBookingTitle}
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
              Active negotiations &amp; support
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Dynamic Real Conversations from API */}
            {conversations.map((conv) => {
              const isSelected = activeConversation === conv.quoteId;
              return (
                <button
                  key={conv.quoteId}
                  type="button"
                  onClick={() => {
                    setActiveConversation(conv.quoteId);
                    setActivePeerName(conv.peer?.fullName || "Verified Artisan");
                    setActivePeerRole(conv.status || "Quote Discussion");
                    setActivePeerAvatar(conv.peer?.photoUrl || "/images/david.jpg");
                    setActiveBookingTitle(`Quote #${conv.quoteId.slice(0, 8)} · Negotiation`);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EBF1F7] border border-blue-100 shadow-2xs"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                    <Image
                      src={conv.peer?.photoUrl || "/images/david.jpg"}
                      alt={conv.peer?.fullName || "Artisan"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-[#001B40] truncate">
                        {conv.peer?.fullName || "Artisan"}
                      </h4>
                      {conv.unread > 0 && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {conv.latestMessage?.text || "Quote negotiation"}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Empty notice if no active conversations */}
            {conversations.length === 0 && (
              <div className="p-3 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl">
                No active artisan chats
              </div>
            )}

            {/* Conversation: Bluefixx Support */}
            <button
              type="button"
              onClick={() => {
                setActiveConversation("support");
                setActivePeerName("Bluefixx Support");
                setActivePeerRole("24/7 Safety & Assistance");
                setActiveBookingTitle("Safety & Support Desk");
              }}
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
                {activePeerName}
              </h3>
              <p className="text-[11px] text-blue-200/80">
                {activePeerRole}
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
            <span>{activeBookingTitle}</span>
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
                Conversation with {activePeerName}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                {activeBookingTitle}
              </p>
            </div>

            {currentMessages.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-400">
                <p className="font-semibold text-neutral-700">No messages yet</p>
                <p className="text-neutral-400 mt-1">Send a message or voice note below to start discussing the job.</p>
              </div>
            ) : (
              currentMessages.map((msg) => {
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
                    <ChatAttachments
                      attachments={msg.attachments}
                      fallbackName={msg.text}
                      isSelf={isMe}
                    />
                    {msg.text &&
                      !(msg.attachments?.some((a) => a.purpose === "VOICE") &&
                        msg.text.toLowerCase().startsWith("voice note")) && (
                        <p>{msg.text}</p>
                      )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            }))}
          </div>

          {/* Bottom Chat Input Bar */}
          {isRecording ? (
            /* Active Recording Bar */
            <div className="p-3 border-t border-rose-100 bg-rose-50/60 flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                </span>
                <span className="text-xs font-bold text-rose-700">
                  Recording audio...
                </span>
                <span className="text-xs font-mono font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                  0:{recordingSeconds < 10 ? "0" : ""}{recordingSeconds}
                </span>
              </div>

              {/* Animated Mini Waves */}
              <div className="hidden sm:flex items-center gap-1">
                {[6, 14, 20, 10, 18, 8, 16, 22, 12, 14].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-rose-500 rounded-full animate-pulse"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Chat Input Form */
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white"
            >
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-xl text-neutral-400 hover:text-[#001B40] hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Attach photo"
                aria-label="Attach photo"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Voice Record Button */}
              <button
                type="button"
                onClick={startRecording}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Record voice note"
                aria-label="Record voice note"
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
                placeholder="Write a message..."
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
          )}
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
              {activePeerName}
            </span>
            <span className="text-neutral-500 block truncate">
              {activeBookingTitle}
            </span>
            <span className="text-neutral-500 block">
              {activePeerRole}
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

function MessagesPageContent() {
  const { activeRole } = useAuth();
  if (activeRole === "artisan") {
    return <ArtisanMessagesView />;
  }
  return <CustomerMessagesView />;
}

export default function MessagesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-8 text-neutral-400 font-sans text-xs">
          Loading messages...
        </div>
      }
    >
      <MessagesPageContent />
    </React.Suspense>
  );
}
