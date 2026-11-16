"use client";

import React, { useEffect, useRef, useState } from "react";
import { getMediaUrlApi } from "@/lib/api/media";
import type { ChatMessageAttachment } from "@/types/customer";

export function extractChatAttachments(raw: {
  attachments?: ChatMessageAttachment[];
  mediaIds?: string[];
  text?: string;
}): ChatMessageAttachment[] {
  if (Array.isArray(raw.attachments) && raw.attachments.length > 0) {
    return raw.attachments;
  }
  if (Array.isArray(raw.mediaIds) && raw.mediaIds.length > 0) {
    const looksLikeVoice =
      typeof raw.text === "string" && raw.text.toLowerCase().startsWith("voice note");
    return raw.mediaIds.map((id) => ({
      id,
      purpose: looksLikeVoice ? "VOICE" : "CHAT",
      resourceType: looksLikeVoice ? "video" : "image",
    }));
  }
  return [];
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const rounded = Math.max(1, Math.round(seconds));
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageAttachment({
  attachment,
}: {
  attachment: ChatMessageAttachment;
}) {
  const [url, setUrl] = useState<string | null>(attachment.localUrl ?? null);

  useEffect(() => {
    if (attachment.localUrl) {
      setUrl(attachment.localUrl);
      return;
    }
    let mounted = true;
    getMediaUrlApi(attachment.id)
      .then((res) => {
        if (mounted && res?.url) setUrl(res.url);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [attachment.id, attachment.localUrl]);

  if (!url) {
    return (
      <div className="w-48 h-32 rounded-xl bg-black/10 animate-pulse mb-2" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-2 rounded-xl overflow-hidden max-w-xs"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={attachment.fileName || "Image attachment"}
        className="w-full max-h-56 object-cover rounded-xl"
      />
    </a>
  );
}

function VoiceAttachment({
  attachment,
  isSelf,
}: {
  attachment: ChatMessageAttachment;
  isSelf: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      setLoading(true);
      let src = attachment.localUrl;
      if (!src) {
        const res = await getMediaUrlApi(attachment.id);
        src = res?.url;
      }
      if (!src) return;

      if (!audioRef.current || audioRef.current.src !== src) {
        audioRef.current = new Audio(src);
        audioRef.current.onended = () => setPlaying(false);
      }
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-1 min-w-[190px]">
      <button
        type="button"
        onClick={togglePlay}
        disabled={loading}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-transform ${
          isSelf ? "bg-white text-[#001B40]" : "bg-[#001B40] text-white"
        }`}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-0.5 flex-1 h-5">
        {[3, 6, 8, 4, 10, 14, 8, 12, 16, 7, 11, 15, 9, 6, 12, 8, 4, 10, 5, 8, 3].map(
          (h, i) => (
            <span
              key={i}
              style={{ height: `${h * 1.2}px` }}
              className={`w-1 rounded-full transition-colors ${
                playing
                  ? isSelf
                    ? "bg-blue-300 animate-pulse"
                    : "bg-[#001B40] animate-pulse"
                  : isSelf
                  ? "bg-white/60"
                  : "bg-neutral-400/60"
              }`}
            />
          )
        )}
      </div>
      <span
        className={`text-[11px] shrink-0 font-mono ${
          isSelf ? "text-blue-200" : "text-neutral-500"
        }`}
      >
        {formatDuration(attachment.duration)}
      </span>
    </div>
  );
}

function FileAttachment({
  attachment,
  fallbackName,
  isSelf,
}: {
  attachment: ChatMessageAttachment;
  fallbackName?: string;
  isSelf: boolean;
}) {
  const [opening, setOpening] = useState(false);

  const handleOpen = async () => {
    try {
      setOpening(true);
      const url = attachment.localUrl ?? (await getMediaUrlApi(attachment.id)).url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // ignore
    } finally {
      setOpening(false);
    }
  };

  const sizeLabel = formatBytes(attachment.bytes);
  const label = attachment.fileName || fallbackName || "File attachment";

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={opening}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1.5 text-left transition-colors cursor-pointer ${
        isSelf
          ? "bg-white/10 hover:bg-white/20 text-white"
          : "bg-neutral-200/70 hover:bg-neutral-200 text-neutral-800"
      }`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{label}</p>
        {sizeLabel && (
          <p
            className={`text-[10px] ${
              isSelf ? "text-blue-200" : "text-neutral-500"
            }`}
          >
            {sizeLabel}
          </p>
        )}
      </div>
      <span className="text-[11px] font-bold shrink-0">
        {opening ? "..." : "Open"}
      </span>
    </button>
  );
}

export function ChatAttachments({
  attachments,
  fallbackName,
  isSelf,
}: {
  attachments?: ChatMessageAttachment[];
  fallbackName?: string;
  isSelf: boolean;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {attachments.map((att) => {
        if (att.purpose === "VOICE") {
          return (
            <VoiceAttachment key={att.id} attachment={att} isSelf={isSelf} />
          );
        }
        if (att.resourceType === "image") {
          return <ImageAttachment key={att.id} attachment={att} />;
        }
        return (
          <FileAttachment
            key={att.id}
            attachment={att}
            fallbackName={fallbackName}
            isSelf={isSelf}
          />
        );
      })}
    </div>
  );
}
