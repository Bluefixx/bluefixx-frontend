import { apiClient } from "./client";
import { getMediaUrlApi } from "./media";
import {
  WorkerVerificationCase,
  VerificationCaseStatus,
  VerificationPriority,
  VerificationDocument,
} from "@/features/admin/types";

// ============================================================================
// Backend Contracts (Admin Worker Verification API contract)
// ============================================================================

export interface VerificationDayDecision {
  date?: string;
  day?: string;
  approved: number;
  rejected: number;
  review: number;
}

export interface AdminVerificationStatsResponse {
  pending: number;
  inReview: number;
  requiresInfo: number;
  rejected: number;
  approvedTotal: number;
  approvedThisWeek: number;
  rejectedThisWeek: number;
  avgTurnaroundHours: number | null;
  decisionsByDay: VerificationDayDecision[];
}

export type BackendVerificationApproval =
  | "PENDING"
  | "UNDER_REVIEW"
  | "REQUIRES_INFO"
  | "APPROVED"
  | "REJECTED";

export interface GetVerificationQueueParams {
  limit?: number; // 1-100, default 30
  cursor?: string; // last artisan UUID
  q?: string; // name, email, or phone
  status?: BackendVerificationApproval;
  trade?: string; // trade name substring
}

export interface BackendReviewerAssignment {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

export interface BackendVerificationQueueItem {
  artisanId: string;
  worker?: {
    id?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    location?: string;
    address?: string;
    experienceYears?: number;
    registeredDate?: string;
    jobsCompleted?: number;
    rating?: number;
    lifetimeEarningsKobo?: number;
  };
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  tradeNames?: string[];
  services?: Array<{ id: string; name: string }>;
  approval: BackendVerificationApproval;
  identityStatus: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  submittedAt: string;
  identityDocCount?: number;
  portfolioDocCount?: number;
  reviewFeedback?: string | null;
  assignedReviewer?: BackendReviewerAssignment | string | null;
}

export interface BackendVerificationQueueResponse {
  items: BackendVerificationQueueItem[];
  nextCursor: string | null;
}

export interface BackendWorkerReviewDetailResponse {
  artisanId: string;
  worker?: {
    id?: string;
    code?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    location?: string;
    address?: string;
    experienceYears?: number;
    registeredDate?: string;
    jobsCompleted?: number;
    rating?: number;
    lifetimeEarningsKobo?: number;
  };
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  approval: BackendVerificationApproval;
  identityStatus: string;
  assignedReviewer?: BackendReviewerAssignment | string | null;
  submittedAt: string;
  reviewFeedback?: string | null;
  rejectedSteps?: string[];
  tradeNames?: string[];
  services?: Array<{
    id: string;
    name: string;
    pricingType?: string;
    basePriceKobo?: number;
  }>;
  activityHistory?: Array<{
    date: string;
    event: string;
    author?: string;
  }>;
  ratingsSummary?: {
    average: number;
    count: number;
  };
  earningsSummary?: {
    totalKobo: number;
    completedJobs: number;
  };
  documents?: Array<{
    id: string;
    mediaId?: string;
    type: string;
    name: string;
    status: "VALID" | "FLAGGED" | "PENDING";
    url?: string;
    submittedAt?: string;
    flagReason?: string;
  }>;
  mediaIds?: {
    ninSlip?: string;
    idCard?: string;
    selfie?: string;
    tradeCert?: string;
    proofOfAddress?: string;
    portfolio?: string[];
  };
}

export interface BackendAdminArtisanIdentityResponse {
  id: string;
  userId: string;
  nin?: string | null;
  bvn?: string | null;
  idCardUrl?: string | null;
  selfieUrl?: string | null;
  proofOfAddressUrl?: string | null;
  tradeCertificateUrl?: string | null;
  status: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  notes?: string | null;
  mediaIds?: {
    idCard?: string;
    selfie?: string;
    proofOfAddress?: string;
    tradeCertificate?: string;
  };
  portfolioIds?: string[];
}

export interface AssignReviewerPayload {
  reviewerId: string | null; // null to unassign
}

export type RequestInfoCategory =
  | "Identity mismatch"
  | "Document expired"
  | "Guarantor details incomplete"
  | "Proof of address match fail"
  | "Unclear / blurry photo";

export interface RequestInfoPayload {
  category: RequestInfoCategory;
  message: string;
}

export type RejectedStep = "details" | "identity" | "trades" | "pricing" | "portfolio";

export interface ApproveArtisanPayload {
  approve: true;
  note?: string;
  verifiedLegalName: string;
}

export interface RejectArtisanPayload {
  approve: false;
  note: string;
  rejectedSteps: RejectedStep[];
}

export type ReviewArtisanPayload = ApproveArtisanPayload | RejectArtisanPayload;

// ============================================================================
// Data Mappers: Backend Queue / Detail -> Frontend WorkerVerificationCase
// ============================================================================

export function mapBackendApprovalToCaseStatus(
  approval: BackendVerificationApproval | string
): VerificationCaseStatus {
  switch (approval) {
    case "UNDER_REVIEW":
      return "IN_REVIEW";
    case "REQUIRES_INFO":
      return "REQUIRES_INFO";
    case "APPROVED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    case "PENDING":
    default:
      return "PENDING";
  }
}

export function mapCaseStatusToBackendApproval(
  status: VerificationCaseStatus | string
): BackendVerificationApproval {
  switch (status) {
    case "IN_REVIEW":
      return "UNDER_REVIEW";
    case "REQUIRES_INFO":
      return "REQUIRES_INFO";
    case "APPROVED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    case "PENDING":
    default:
      return "PENDING";
  }
}

export function mapQueueItemToVerificationCase(
  item: BackendVerificationQueueItem
): WorkerVerificationCase {
  const workerObj = item.worker || {};
  const name = workerObj.fullName || workerObj.name || item.fullName || "Worker";
  const email = workerObj.email || item.email || "";
  const phone = workerObj.phone || item.phone || "";
  const location = workerObj.location || item.location || "Lagos, Nigeria";
  const primaryTrade =
    (item.tradeNames && item.tradeNames[0]) ||
    (item.services && item.services[0]?.name) ||
    "General Artisan";

  // Reviewer display
  let reviewerName = "Unassigned";
  if (item.assignedReviewer) {
    if (typeof item.assignedReviewer === "string") {
      reviewerName = item.assignedReviewer;
    } else if (typeof item.assignedReviewer === "object") {
      reviewerName =
        item.assignedReviewer.fullName || item.assignedReviewer.name || "Assigned Admin";
    }
  }

  // Priority
  let priority: VerificationPriority = "MEDIUM";
  if (item.priority) {
    priority = item.priority;
  } else if (item.approval === "PENDING" && (item.identityDocCount ?? 0) >= 2) {
    priority = "HIGH";
  }

  // Generate placeholder documents from doc counts if list not expanded in queue
  const docs: VerificationDocument[] = [];
  if (item.identityDocCount && item.identityDocCount > 0) {
    docs.push({
      id: `doc-nin-${item.artisanId}`,
      type: "NIN",
      name: "Government ID / NIN Slip",
      status: item.identityStatus === "VERIFIED" ? "VALID" : "PENDING",
      url: "/icons/icon-document.svg",
      submittedAt: item.submittedAt,
    });
  }
  if (item.portfolioDocCount && item.portfolioDocCount > 0) {
    docs.push({
      id: `doc-port-${item.artisanId}`,
      type: "PORTFOLIO",
      name: "Trade Qualification & Portfolio Evidence",
      status: "VALID",
      url: "/icons/icon-document.svg",
      submittedAt: item.submittedAt,
    });
  }
  if (docs.length === 0) {
    docs.push({
      id: `doc-id-${item.artisanId}`,
      type: "NIN",
      name: "Identity & Verification Documents",
      status: "PENDING",
      url: "/icons/icon-document.svg",
      submittedAt: item.submittedAt,
    });
  }

  // Derive short readable code
  const code = `W-${item.artisanId.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  const formattedDate = item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return {
    id: item.artisanId,
    worker: {
      id: workerObj.id || item.artisanId,
      code,
      name,
      avatarUrl: workerObj.avatarUrl || item.avatarUrl,
      phone,
      email,
      trade: primaryTrade,
      location,
      address: workerObj.address || location,
      experienceYears: workerObj.experienceYears ?? 3,
      registeredDate: workerObj.registeredDate || formattedDate,
      jobsCompleted: workerObj.jobsCompleted ?? 0,
      rating: workerObj.rating ?? 5.0,
      lifetimeEarnings: workerObj.lifetimeEarningsKobo
        ? Math.round(workerObj.lifetimeEarningsKobo / 100)
        : 0,
    },
    status: mapBackendApprovalToCaseStatus(item.approval),
    priority,
    submittedAt: formattedDate,
    assignedReviewer: reviewerName,
    documents: docs,
    history: item.reviewFeedback
      ? [
          {
            date: formattedDate,
            event: `Review Feedback: ${item.reviewFeedback}`,
            author: reviewerName,
          },
        ]
      : [
          {
            date: formattedDate,
            event: "Worker submitted profile and verification documents",
            author: name,
          },
        ],
  };
}

export function mapDetailToVerificationCase(
  detail: BackendWorkerReviewDetailResponse
): WorkerVerificationCase {
  const workerObj = detail.worker || {};
  const name = workerObj.fullName || workerObj.name || detail.fullName || "Worker";
  const email = workerObj.email || detail.email || "";
  const phone = workerObj.phone || detail.phone || "";
  const location = workerObj.location || detail.location || "Lagos, Nigeria";
  const primaryTrade =
    (detail.tradeNames && detail.tradeNames[0]) ||
    (detail.services && detail.services[0]?.name) ||
    "General Artisan";

  let reviewerName = "Unassigned";
  if (detail.assignedReviewer) {
    if (typeof detail.assignedReviewer === "string") {
      reviewerName = detail.assignedReviewer;
    } else if (typeof detail.assignedReviewer === "object") {
      reviewerName =
        detail.assignedReviewer.fullName || detail.assignedReviewer.name || "Assigned Admin";
    }
  }

  const code = workerObj.code || `W-${detail.artisanId.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  const formattedDate = detail.submittedAt
    ? new Date(detail.submittedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Map documents
  const docs: VerificationDocument[] = (detail.documents || []).map((d) => ({
    id: d.id,
    type: (d.type as any) || "NIN",
    name: d.name,
    status: d.status || "PENDING",
    url: d.url || "/icons/icon-document.svg",
    submittedAt: d.submittedAt || formattedDate,
    flagReason: d.flagReason,
  }));

  if (docs.length === 0) {
    if (detail.mediaIds?.idCard) {
      docs.push({
        id: "doc-id-card",
        type: "NIN",
        name: "Government ID Card",
        status: detail.identityStatus === "VERIFIED" ? "VALID" : "PENDING",
        url: `/api/v1/media/${detail.mediaIds.idCard}/url`,
        submittedAt: formattedDate,
      });
    }
    if (detail.mediaIds?.tradeCert) {
      docs.push({
        id: "doc-trade-cert",
        type: "TRADE_CERT",
        name: "Trade Skill Certification",
        status: "VALID",
        url: `/api/v1/media/${detail.mediaIds.tradeCert}/url`,
        submittedAt: formattedDate,
      });
    }
    if (detail.mediaIds?.selfie) {
      docs.push({
        id: "doc-selfie",
        type: "GUARANTOR",
        name: "Live Verification Selfie",
        status: "VALID",
        url: `/api/v1/media/${detail.mediaIds.selfie}/url`,
        submittedAt: formattedDate,
      });
    }
    if (docs.length === 0) {
      docs.push({
        id: `doc-default-${detail.artisanId}`,
        type: "NIN",
        name: "Identity & Verification Documents",
        status: detail.identityStatus === "VERIFIED" ? "VALID" : "PENDING",
        url: "/icons/icon-document.svg",
        submittedAt: formattedDate,
      });
    }
  }

  const history = (detail.activityHistory || []).map((h) => ({
    date: h.date,
    event: h.event,
    author: h.author || "Admin",
  }));

  if (history.length === 0) {
    if (detail.reviewFeedback) {
      history.push({
        date: formattedDate,
        event: `Review Feedback: ${detail.reviewFeedback}`,
        author: reviewerName,
      });
    } else {
      history.push({
        date: formattedDate,
        event: "Verification profile submitted for review",
        author: name,
      });
    }
  }

  return {
    id: detail.artisanId,
    worker: {
      id: workerObj.id || detail.artisanId,
      code,
      name,
      avatarUrl: workerObj.avatarUrl || detail.avatarUrl,
      phone,
      email,
      trade: primaryTrade,
      location,
      address: workerObj.address || location,
      experienceYears: workerObj.experienceYears ?? 3,
      registeredDate: workerObj.registeredDate || formattedDate,
      jobsCompleted: detail.earningsSummary?.completedJobs ?? workerObj.jobsCompleted ?? 0,
      rating: detail.ratingsSummary?.average ?? workerObj.rating ?? 5.0,
      lifetimeEarnings: detail.earningsSummary?.totalKobo
        ? Math.round(detail.earningsSummary.totalKobo / 100)
        : workerObj.lifetimeEarningsKobo
        ? Math.round(workerObj.lifetimeEarningsKobo / 100)
        : 0,
    },
    status: mapBackendApprovalToCaseStatus(detail.approval),
    priority: "HIGH",
    submittedAt: formattedDate,
    assignedReviewer: reviewerName,
    documents: docs,
    history,
  };
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * 1. Dashboard counters and chart
 * GET /api/v1/admin/verification/stats
 */
export async function getAdminVerificationStatsApi(): Promise<AdminVerificationStatsResponse> {
  return apiClient.get<AdminVerificationStatsResponse>("/admin/verification/stats");
}

/**
 * 2. Review queue
 * GET /api/v1/admin/verification
 */
export async function getAdminVerificationQueueApi(
  params?: GetVerificationQueueParams
): Promise<BackendVerificationQueueResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.cursor) queryParams.cursor = params.cursor;
  if (params?.q) queryParams.q = params.q.trim();
  if (params?.status) queryParams.status = params.status;
  if (params?.trade) queryParams.trade = params.trade.trim();

  return apiClient.get<BackendVerificationQueueResponse>("/admin/verification", {
    params: queryParams,
  });
}

/**
 * 3. Worker review details and evidence
 * GET /api/v1/admin/verification/{artisanId}
 */
export async function getAdminWorkerVerificationDetailApi(
  artisanId: string
): Promise<BackendWorkerReviewDetailResponse> {
  return apiClient.get<BackendWorkerReviewDetailResponse>(
    `/admin/verification/${encodeURIComponent(artisanId)}`
  );
}

/**
 * 4. Audited identity-only endpoint
 * GET /api/v1/admin/artisans/{artisanId}/identity
 */
export async function getAdminArtisanIdentityEvidenceApi(
  artisanId: string
): Promise<BackendAdminArtisanIdentityResponse> {
  return apiClient.get<BackendAdminArtisanIdentityResponse>(
    `/admin/artisans/${encodeURIComponent(artisanId)}/identity`
  );
}

/**
 * 5. Reviewer assignment
 * POST /api/v1/admin/verification/{artisanId}/assign
 */
export async function assignVerificationReviewerApi(
  artisanId: string,
  payload: AssignReviewerPayload
): Promise<{ message?: string; assignedReviewer?: any }> {
  return apiClient.post<{ message?: string; assignedReviewer?: any }>(
    `/admin/verification/${encodeURIComponent(artisanId)}/assign`,
    payload
  );
}

/**
 * 6. Request more information
 * POST /api/v1/admin/verification/{artisanId}/request-info
 */
export async function requestVerificationInfoApi(
  artisanId: string,
  payload: RequestInfoPayload
): Promise<{ message?: string }> {
  return apiClient.post<{ message?: string }>(
    `/admin/verification/${encodeURIComponent(artisanId)}/request-info`,
    payload
  );
}

/**
 * 7. Approve or reject decision
 * POST /api/v1/admin/artisans/{artisanId}/review
 */
export async function reviewArtisanDecisionApi(
  artisanId: string,
  payload: ReviewArtisanPayload
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/admin/artisans/${encodeURIComponent(artisanId)}/review`,
    payload
  );
}

export { getMediaUrlApi };
