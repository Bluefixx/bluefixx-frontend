"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { AdminUser } from "../types";

interface OpsSendNotificationModalProps {
  users: AdminUser[];
  isOpen: boolean;
  onClose: () => void;
}

export function OpsSendNotificationModal({
  users,
  isOpen,
  onClose,
}: OpsSendNotificationModalProps) {
  const [channel, setChannel] = useState<"IN_APP" | "EMAIL" | "SMS" | "ALL">("ALL");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || users.length === 0) return null;

  const isBulk = users.length > 1;
  const targetLabel = isBulk ? `${users.length} selected users` : users[0].fullName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter a title and message.");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(
        `Notification sent to ${targetLabel} via ${channel === "ALL" ? "In-App, Email & SMS" : channel}.`
      );
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 border border-neutral-200">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#0F1115]">
              Send Notification
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Recipient: <span className="font-bold text-[#001B40]">{targetLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#001B40] bg-white cursor-pointer"
              >
                <option value="ALL">All (In-App, Email, SMS)</option>
                <option value="IN_APP">In-App Push Only</option>
                <option value="EMAIL">Email Only</option>
                <option value="SMS">SMS Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#001B40] bg-white cursor-pointer"
              >
                <option value="NORMAL">Standard</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent SLA Broadcast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Action Required: Verification Document Update"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#001B40]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Message Body <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here. Markdown format is supported in email notifications."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#001B40]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSending ? "Sending..." : `Send to ${isBulk ? `${users.length} users` : "user"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
