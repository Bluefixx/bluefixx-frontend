"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MOCK_ADMIN_NOTIFICATIONS, MOCK_NOTIFICATION_TEMPLATES } from "../mockPlatformData";
import { AdminBroadcastNotification, AdminNotificationTemplate } from "../types";
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

  // Template Modal / Drawer State
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Retry State
  const [retryingId, setRetryingId] = useState<string | null>(null);

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

  // Load Template Handler
  const handleSelectTemplate = (template: AdminNotificationTemplate) => {
    setSubject(template.subject);
    setMessage(template.message);
    setAudience(template.audience);
    setSegmentFilter(template.segmentFilter);
    setChannels(template.channels);
    setCallToAction(template.callToAction || "");
    setIsTemplatePickerOpen(false);
    setToastMessage(`Template "${template.title}" loaded into composer`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Retry Failed Delivery Handler
  const handleRetryFailed = (notifId: string) => {
    setRetryingId(notifId);
    setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) => {
          if (item.id === notifId) {
            return {
              ...item,
              deliveredCount: item.deliveredCount + item.failedCount,
              failedCount: 0,
            };
          }
          return item;
        })
      );
      setRetryingId(null);
      setToastMessage("Failed deliveries re-queued and successfully dispatched!");
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Notifications</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Mass communication is a one-way door. Audience size, channels and schedule are confirmed before anything sends.
          </p>
        </div>

        {/* Quick Load Template Action */}
        <button
          type="button"
          onClick={() => setIsTemplatePickerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-[#001B40] shadow-2xs cursor-pointer"
        >
          <span>📑 Load Template</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Composer & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Composer Form (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#001B40]">Composer</h2>
            <button
              type="button"
              onClick={() => setIsTemplatePickerOpen(true)}
              className="text-[11px] font-semibold text-[#074292] hover:underline cursor-pointer"
            >
              Choose from pre-built templates →
            </button>
          </div>

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
                  <option value="Talents">Talents / Apprentices</option>
                  <option value="Pending verification">Pending verification</option>
                  <option value="All users">All users (Universal)</option>
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
                  <option value="Tier-2 verified only">Tier-2 verified only</option>
                  <option value="Active in last 30 days">Active in last 30 days</option>
                </select>
              </div>
            </div>

            {/* Channels Checkboxes */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1.5">
                Channels <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={channels.includes("In-app")}
                    onChange={() => toggleChannel("In-app")}
                    className="rounded text-[#001B40]"
                  />
                  <span>In-app push &amp; notification feed</span>
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

                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-400">
                  <input
                    type="checkbox"
                    checked={channels.includes("SMS")}
                    onChange={() => toggleChannel("SMS")}
                    className="rounded text-[#001B40]"
                  />
                  <span>SMS</span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-normal">
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
                placeholder="e.g. September payout schedule update"
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
              />
            </div>

            {/* Message Body with Character Counter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-neutral-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">{message.length}/600</span>
              </div>
              <textarea
                rows={5}
                required
                maxLength={600}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write in plain language. Include what changes, when, and what the user must do."
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40] leading-relaxed"
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

        {/* Right Column: Live Push Preview & Send Summary (1 span) */}
        <div className="space-y-6">
          {/* Mobile Preview Box */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Preview</h2>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/BFLogoBlue.svg"
                  alt="Bluefixx"
                  width={18}
                  height={18}
                  className="shrink-0"
                />
                <span className="font-extrabold text-[#001B40] text-xs">Bluefixx</span>
                <span className="text-[10px] text-neutral-400 ml-auto">now</span>
              </div>

              <div className="font-bold text-neutral-900 text-xs">
                {subject.trim() || "Your subject appears here"}
              </div>

              <p className="text-[11px] text-neutral-600 line-clamp-3 leading-relaxed">
                {message.trim() ||
                  "Your message body appears here exactly as the user will read it on their device."}
              </p>

              {callToAction.trim() && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-[#074292] underline">
                    {callToAction} →
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Send Summary Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#001B40]">Send summary</h2>

            <div className="space-y-2.5 divide-y divide-neutral-100">
              <div className="flex justify-between items-center pt-1">
                <span className="text-neutral-500">Recipients</span>
                <span className="font-bold text-neutral-900">
                  {recipientCount.toLocaleString()} {audience.toLowerCase()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-500">Channels</span>
                <span className="font-bold text-neutral-900">
                  {channels.length > 0 ? channels.join(", ") : "None selected"}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-500">Delivery</span>
                <span className="font-bold text-neutral-900">{delivery}</span>
              </div>
            </div>

            {/* Warning Callout Matching Screenshot */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <span>⚠</span>
                <span>This cannot be recalled</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
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

      {/* Delivery History Section with Failed Retry Action */}
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

                {/* 1-Click Retry Failed Recipients Action */}
                {h.failedCount > 0 && (
                  <button
                    type="button"
                    disabled={retryingId === h.id}
                    onClick={() => handleRetryFailed(h.id)}
                    className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    {retryingId === h.id ? "Retrying..." : `Retry Failed (${h.failedCount})`}
                  </button>
                )}

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

      {/* Template Picker Modal */}
      {isTemplatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#001B40]">
                  Broadcast Templates
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pre-configured operational messages for common platform events.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {MOCK_NOTIFICATION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-3.5 rounded-xl border border-neutral-200 hover:border-[#001B40] hover:bg-neutral-50/70 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#001B40] text-xs">{tmpl.title}</span>
                    <span className="text-[10px] bg-blue-50 text-[#001B40] px-2 py-0.5 rounded font-bold border border-blue-100">
                      {tmpl.audience}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">{tmpl.subject}</p>
                  <p className="text-[11px] text-neutral-500 line-clamp-2">{tmpl.message}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
