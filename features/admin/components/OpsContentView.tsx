"use client";

import React, { useState } from "react";
import { MOCK_ADMIN_CONTENT } from "../mockPlatformData";
import { AdminContentItem, ContentKind, ContentAudienceScope } from "../types";
import { OpsContentModal } from "./OpsContentModal";

export function OpsContentView() {
  const [items, setItems] = useState<AdminContentItem[]>(MOCK_ADMIN_CONTENT);
  const [activeTab, setActiveTab] = useState<ContentKind>("FAQ");

  const [selectedItemForEdit, setSelectedItemForEdit] = useState<AdminContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveItem = (savedItem: Partial<AdminContentItem>) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? ({ ...i, ...savedItem } as AdminContentItem) : i));
      }
      return [savedItem as AdminContentItem, ...prev];
    });
  };

  const faqs = items.filter((i) => i.kind === "FAQ");
  const testimonials = items.filter((i) => i.kind === "TESTIMONIAL");
  const announcements = items.filter((i) => i.kind === "ANNOUNCEMENT");

  const renderAudienceBadge = (scope?: ContentAudienceScope) => {
    switch (scope) {
      case "WORKERS_ONLY":
        return (
          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Workers Only
          </span>
        );
      case "CUSTOMERS_ONLY":
        return (
          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Customers Only
          </span>
        );
      case "TALENTS_ONLY":
        return (
          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            Talents Only
          </span>
        );
      default:
        return (
          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600">
            Public / All
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Growth & content</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">Content</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Public-facing copy that answers the questions support keeps receiving. Configured with audience segmentation and scheduled auto-expiry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedItemForEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
        >
          <span>+ New entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("FAQ")}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "FAQ"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>FAQs</span>
            <span className="text-[10px] text-neutral-400 font-normal">({faqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TESTIMONIAL")}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "TESTIMONIAL"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Testimonials</span>
            <span className="text-[10px] text-neutral-400 font-normal">({testimonials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ANNOUNCEMENT")}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "ANNOUNCEMENT"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Announcements</span>
            <span className="text-[10px] text-neutral-400 font-normal">({announcements.length})</span>
          </button>
        </nav>
      </div>

      {/* FAQs Tab */}
      {activeTab === "FAQ" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-900 text-sm">{faq.title}</h3>
                  {renderAudienceBadge(faq.audienceScope)}
                </div>
                <p className="text-[11px] text-neutral-500">
                  {faq.category} · updated {faq.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ● {faq.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForEdit(faq);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === "TESTIMONIAL" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-900 text-sm">&ldquo;{t.title}&rdquo;</h3>
                  {renderAudienceBadge(t.audienceScope)}
                </div>
                <p className="text-[11px] text-neutral-500">
                  {t.authorName} · {t.authorRole} {t.snippet ? `· ${t.snippet}` : ""} · published {t.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === "Published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  ● {t.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForEdit(t);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "ANNOUNCEMENT" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-900 text-sm">{ann.title}</h3>
                  {renderAudienceBadge(ann.audienceScope)}
                  {ann.expiresAt && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⏱ Expires {ann.expiresAt}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  {ann.targetAudience} · published {ann.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ann.status === "Published"
                      ? "bg-emerald-100 text-emerald-800"
                      : ann.status === "Expired"
                      ? "bg-neutral-200 text-neutral-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  ● {ann.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForEdit(ann);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <OpsContentModal
        item={selectedItemForEdit}
        defaultKind={activeTab}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItemForEdit(null);
        }}
        onSave={handleSaveItem}
      />
    </div>
  );
}
