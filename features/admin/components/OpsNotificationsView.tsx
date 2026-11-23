"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MOCK_ADMIN_NOTIFICATIONS } from "../mockPlatformData";
import { AdminBroadcastNotification } from "../types";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

export function OpsNotificationsView() {
  const [history, setHistory] = useState<AdminBroadcastNotification[]>(MOCK_ADMIN_NOTIFICATIONS);

  // Form State
  const [audience, setAudience] = useState("Workers");
  const [segmentFilter, setSegmentFilter] = useState("No further filter");
  const [channels, setChannels] = useState<string[]>(["In-app"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [delivery, setDelivery] = useState("Immediately");

  // PIN & Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Recipient computation
  const recipientCount = React.useMemo(() => {
    if (audience === "Workers") return 4902;
    if (audience === "Customers") return 12850;
    if (audience === "Talents") return 1204;
    if (audience === "Pending verification") return 268;
    return 18956; // All users
  }, [audience]);

  // Handle Send Test to Me
  const handleSendTest = () => {
    setToastMessage("Test notification sent to simeon.daniel@bluefixx.ng");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger PIN modal before live broadcast
  const handleInitiateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || channels.length === 0) return;
    setIsPinModalOpen(true);
  };

  // Confirmed broadcast after PIN
  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsBroadcasting(true);

    setTimeout(() => {
      const newBroadcast: AdminBroadcastNotification = {
        id: `NOTIF-${Date.now()}`,
        subject: subject.trim(),
        message: message.trim(),
        audience,
        segmentFilter,
        channels,
        callToAction: callToAction.trim() || undefined,
        delivery,
        sentAt: "Just now",
        deliveredCount: recipientCount,
        failedCount: 0,
        status: "Successful",
      };

      setHistory((prev) => [newBroadcast, ...prev]);
      setIsBroadcasting(false);
      setSubject("");
      setMessage("");
      setCallToAction("");
      setToastMessage(`Broadcast successfully dispatched to ${recipientCount.toLocaleString()} ${audience.toLowerCase()}`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1">Notifications</div>
        <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
          Notifications
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Mass communication is a one-way door. Audience size, channels and schedule are confirmed before anything sends.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Composer & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Composer Form (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 text-xs">
          <h2 className="text-sm font-bold text-[#001B40]">Composer</h2>

          <form onSubmit={handleInitiateBroadcast} className="space-y-4">
            {/* Audience & Segment Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="Workers">Workers</option>
                  <option value="Customers">Customers</option>
                  <option value="Talents">Talents</option>
                  <option value="Pending verification">Pending verification</option>
                  <option value="All users">All users</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Segment filter</label>
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="No further filter">No further filter</option>
                  <option value="Lagos region only">Lagos region only</option>
                  <option value="Abuja region only">Abuja region only</option>
                  <option value="Enugu region only">Enugu region only</option>
                  <option value="High volume users">High volume users</option>
                  <option value="Inactive 30+ days">Inactive 30+ days</option>
                </select>
              </div>
            </div>

            {/* Channels */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1.5">Channels</label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={channels.includes("In-app")}
                    onChange={() => toggleChannel("In-app")}
                    className="rounded text-[#001B40]"
                  />
                  <span>In-app</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={channels.includes("Email")}
                    onChange={() => toggleChannel("Email")}
                    className="rounded text-[#001B40]"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2 text-neutral-400 font-medium cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" />
                  <span>SMS</span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.2 rounded border border-neutral-200">
                    Future-ready
                  </span>
                </label>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. September payout schedule"
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
              />
            </div>

            {/* Message with 600 char counter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-neutral-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {message.length}/600
                </span>
              </div>
              <textarea
                rows={5}
                required
                maxLength={600}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write in plain language. Include what changes, when, and what the user must do."
                className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
              />
            </div>

            {/* Call to Action & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Call to action</label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="e.g. View payout schedule"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Delivery</label>
                <select
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="Immediately">Immediately</option>
                  <option value="Schedule for later">Schedule for later</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Preview, Send Summary & Actions */}
        <div className="space-y-4">
          {/* Live Mobile Notification Preview */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Preview</span>
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/icons/BFLogoBlue.svg"
                    alt="BlueFixx"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                  />
                  <span className="font-bold text-[#001B40]">Bluefixx</span>
                </div>
                <span>now</span>
              </div>
              <p className="font-bold text-xs text-neutral-900 leading-snug">
                {subject.trim() || "Your subject appears here"}
              </p>
              <p className="text-[11px] text-neutral-600 line-clamp-3 leading-relaxed">
                {message.trim() || "Your message body appears here exactly as the user will read it."}
              </p>
              {callToAction.trim() && (
                <div className="pt-1">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#001B40] text-white">
                    {callToAction}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Send Summary Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 text-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Send summary</span>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Recipients:</span>
                <span className="font-extrabold text-[#001B40]">{recipientCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Channels:</span>
                <span className="font-semibold text-neutral-800">{channels.join(", ") || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery:</span>
                <span className="font-semibold text-neutral-800">{delivery}</span>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-[11px] space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <span>⚠</span>
                <span>This cannot be recalled</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Once sent, messages cannot be withdrawn from a user&apos;s inbox. Send a test to yourself first.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleSendTest}
                className="w-full py-2 px-3 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Send test to me
              </button>
              <button
                type="button"
                onClick={handleInitiateBroadcast}
                disabled={isBroadcasting || !subject.trim() || !message.trim() || channels.length === 0}
                className="w-full py-2.5 px-3 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isBroadcasting ? "Broadcasting..." : "Send now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery History Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#001B40]">Delivery history</h2>

        <div className="divide-y divide-neutral-100">
          {history.map((h) => (
            <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-neutral-900 text-xs">{h.subject}</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {h.segmentFilter} · {h.channels.join(" + ")} · {h.sentAt}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="font-bold text-neutral-800">
                    {h.deliveredCount.toLocaleString()} delivered
                  </span>
                  {h.failedCount > 0 && (
                    <span className="text-red-600 font-bold ml-2">
                      {h.failedCount} failed
                    </span>
                  )}
                </div>

                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    h.status === "Successful"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  ● {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Security PIN Modal for Broadcast Gate */}
      <OpsSecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Authorize Mass Notification Broadcast"
        description={`Confirm broadcast of "${subject}" to ${recipientCount.toLocaleString()} recipients.`}
      />
    </div>
  );
}
