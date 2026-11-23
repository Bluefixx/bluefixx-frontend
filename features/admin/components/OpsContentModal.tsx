"use client";

import React, { useState, useEffect } from "react";
import { AdminContentItem, ContentKind } from "../types";

interface OpsContentModalProps {
  item: AdminContentItem | null;
  defaultKind: ContentKind;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<AdminContentItem>) => void;
}

export function OpsContentModal({
  item,
  defaultKind,
  isOpen,
  onClose,
  onSave,
}: OpsContentModalProps) {
  const isEdit = Boolean(item);

  const [kind, setKind] = useState<ContentKind>(item?.kind || defaultKind);
  const [title, setTitle] = useState(item?.title || "");
  const [content, setContent] = useState(item?.content || "");
  const [category, setCategory] = useState(item?.category || "General");
  const [authorName, setAuthorName] = useState(item?.authorName || "");
  const [authorRole, setAuthorRole] = useState(item?.authorRole || "Customer");
  const [targetAudience, setTargetAudience] = useState(item?.targetAudience || "All users");
  const [status, setStatus] = useState<"Published" | "Pending review" | "Draft" | "Pending">(
    item?.status || "Published"
  );

  useEffect(() => {
    if (item) {
      setKind(item.kind);
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category || "General");
      setAuthorName(item.authorName || "");
      setAuthorRole(item.authorRole || "Customer");
      setTargetAudience(item.targetAudience);
      setStatus(item.status);
    } else {
      setKind(defaultKind);
      setTitle("");
      setContent("");
      setCategory("General");
      setAuthorName("");
      setAuthorRole("Customer");
      setTargetAudience("All users");
      setStatus("Published");
    }
  }, [item, defaultKind, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      id: item ? item.id : `CNT-${kind.slice(0, 3)}-${Date.now()}`,
      kind,
      title: title.trim(),
      content: content.trim(),
      category,
      authorName: authorName.trim() || undefined,
      authorRole: authorRole.trim() || undefined,
      targetAudience,
      status,
      updatedAt: "Just now",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            {isEdit ? `Edit ${kind}` : `New ${kind} entry`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Content Kind */}
          {!isEdit && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["FAQ", "TESTIMONIAL", "ANNOUNCEMENT"] as ContentKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                      kind === k
                        ? "bg-[#001B40] text-white border-[#001B40]"
                        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {k === "FAQ" ? "FAQ" : k === "TESTIMONIAL" ? "Testimonial" : "Announcement"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title / Question */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              {kind === "FAQ" ? "Question *" : kind === "TESTIMONIAL" ? "Quote Heading *" : "Announcement Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                kind === "FAQ"
                  ? "e.g. How does escrow work?"
                  : kind === "TESTIMONIAL"
                  ? "e.g. Found a verified artisan within 30 minutes"
                  : "e.g. August payout schedule update"
              }
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Testimonial Author fields */}
          {kind === "TESTIMONIAL" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Amina Yusuf"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Author Role</label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="Customer">Customer</option>
                  <option value="Artisan">Artisan</option>
                  <option value="Talent">Talent</option>
                </select>
              </div>
            </div>
          )}

          {/* FAQ Category */}
          {kind === "FAQ" && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="Payments / Escrow">Payments / Escrow</option>
                <option value="Verification">Verification</option>
                <option value="Apprenticeship">Apprenticeship</option>
                <option value="Withdrawals">Withdrawals</option>
                <option value="Disputes & Safety">Disputes &amp; Safety</option>
                <option value="General">General</option>
              </select>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. All users, Workers, or Talents · Lagos"
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Full Body Content */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              {kind === "FAQ" ? "Answer / Explanation *" : "Body Content *"}
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the public response in clear language..."
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
            >
              <option value="Published">Published (Live to public)</option>
              <option value="Pending review">Pending review</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending scheduled release</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
            >
              {isEdit ? "Save changes" : "Create entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
