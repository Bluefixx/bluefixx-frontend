import { apiClient } from "./client";
import {
  AdminJob,
  JobPaymentStatus,
  JobDeliveryStatus,
  JobAttentionReason,
} from "@/features/admin/types";

// ============================================================================
// Backend Contracts (Admin Jobs API contract)
// ============================================================================

export type BackendJobStatus =
  | "IN_PROGRESS"
  | "PENDING"
  | "POSTED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type BackendJobPaymentStatus =
  | "IN_ESCROW"
  | "HOLDING"
  | "RELEASED"
  | "DISPUTED"
  | "REFUNDED"
  | "FAILED";

export interface GetAdminJobsQueryParams {
  limit?: number; // 1-100, default 30
  cursor?: string; // last item UUID
  q?: string;
  status?: BackendJobStatus;
  payment?: BackendJobPaymentStatus;
  trade?: string;
  location?: string;
  needsAttention?: boolean;
}

export interface BackendJobPartySummary {
  id: string;
  fullName?: string;
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  trade?: string;
  isSuspended?: boolean;
}

export interface BackendAdminJobItem {
  id: string;
  bookingId: string | null;
  jobPostId?: string;
  title: string;
  customer: BackendJobPartySummary;
  worker: BackendJobPartySummary | null;
  trade: string;
  location: string;
  valueKobo: string | number;
  paymentStatus: JobPaymentStatus;
  deliveryStatus: JobDeliveryStatus;
  postedAt: string;
  needsAttention: boolean;
  attentionReasons?: string[];
  disputeCases?: Array<{
    id: string;
    disputeCode?: string;
    status: string;
  }>;
}

export interface BackendAdminJobsListResponse {
  items: BackendAdminJobItem[];
  totalCount: number;
  attentionCount: number;
  nextCursor: string | null;
}

export interface BackendAdminJobDetailResponse extends BackendAdminJobItem {
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  booking?: {
    id: string;
    status: string;
    totalAmountKobo?: string | number;
    escrowFundedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  } | null;
  payments?: Array<{
    id: string;
    reference: string;
    amountKobo: string | number;
    status: string;
    channel?: string;
    createdAt: string;
  }>;
  refunds?: Array<{
    id: string;
    amountKobo: string | number;
    reason?: string;
    createdAt: string;
  }>;
  proofs?: Array<{
    id: string;
    mediaId?: string;
    type: "BEFORE" | "AFTER" | string;
    url?: string;
    notes?: string;
    createdAt: string;
  }>;
  supportCases?: Array<{
    id: string;
    ticketNumber?: string;
    subject: string;
    status: string;
    priority: string;
  }>;
  dispute?: {
    id: string;
    disputeCode?: string;
    status: string;
    raisedBy?: "CUSTOMER" | "WORKER";
    reason?: string;
    customerClaim?: string;
    workerRebuttal?: string;
    createdAt: string;
    evidencePhotos?: string[];
    resolutionProposal?: string;
  } | null;
  events?: Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }>;
  escrow?: {
    totalKobo?: number;
    workerPayoutKobo?: number;
    platformFeeKobo?: number;
    escrowLockedAt?: string;
    escrowReleasedAt?: string;
    gatewayRef?: string;
  };
}

export interface ForceReleaseEscrowPayload {
  reason: string;
}

export interface RefundEscrowPayload {
  amountKobo: number;
  reason: string;
}

export interface RefundEscrowResponse {
  bookingId: string;
  amountKobo: number;
  fullyRefunded: boolean;
  disputeResolved?: boolean;
}

export interface ReassignWorkerPayload {
  artisanId: string;
  reason: string;
}

export interface ArbitrateDisputePayload {
  outcome: "WORKER_FULL" | "CUSTOMER_FULL" | "SPLIT";
  workerSharePercent: number; // 0-100
  justification: string;
}

export interface ArbitrateDisputeResponse {
  outcome: string;
  workerSharePercent: number;
  refundBaseKobo: number;
}

// ============================================================================
// Data Adapter: Backend Job -> Frontend AdminJob
// ============================================================================

export function mapBackendJobToAdminJob(
  item: BackendAdminJobItem | BackendAdminJobDetailResponse
): AdminJob {
  const detail = item as BackendAdminJobDetailResponse;

  // Derive value in Naira from valueKobo
  const rawValueKobo =
    typeof item.valueKobo === "string"
      ? parseInt(item.valueKobo, 10)
      : typeof item.valueKobo === "number"
      ? item.valueKobo
      : 0;
  const valueNaira = Math.round(rawValueKobo / 100);

  // Short Code
  const shortCode = item.bookingId
    ? `BK-${item.bookingId.replace(/-/g, "").slice(0, 5).toUpperCase()}`
    : `JB-${item.id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  // Customer mapping
  const custName =
    item.customer?.fullName || item.customer?.name || "Customer";
  const custCode =
    item.customer?.code || `C-${(item.customer?.id || "0000").slice(0, 5).toUpperCase()}`;

  // Worker mapping
  let workerMapped: AdminJob["worker"] = undefined;
  if (item.worker) {
    const wName = item.worker.fullName || item.worker.name || "Worker";
    const wCode =
      item.worker.code || `W-${(item.worker.id || "0000").slice(0, 5).toUpperCase()}`;
    workerMapped = {
      id: item.worker.id,
      code: wCode,
      name: wName,
      avatarUrl: item.worker.avatarUrl,
      phone: item.worker.phone || "—",
      trade: item.worker.trade || item.trade,
      isSuspended: Boolean(item.worker.isSuspended),
    };
  }

  // Attention reasons
  let attentionReasonMapped: JobAttentionReason | undefined = undefined;
  if (item.needsAttention && item.attentionReasons && item.attentionReasons.length > 0) {
    const firstReason = item.attentionReasons[0].toUpperCase();
    if (firstReason.includes("OVERDUE")) attentionReasonMapped = "OVERDUE_DELIVERY";
    else if (firstReason.includes("PAYMENT")) attentionReasonMapped = "FAILED_ESCROW";
    else if (firstReason.includes("SUSPENDED")) attentionReasonMapped = "WORKER_SUSPENDED";
    else if (firstReason.includes("DISPUTE")) attentionReasonMapped = "DISPUTED";
    else attentionReasonMapped = "STALLED_ESCROW";
  }

  // Escrow details
  const workerPayoutKobo = detail.escrow?.workerPayoutKobo ?? Math.round(rawValueKobo * 0.9);
  const platformFeeKobo = detail.escrow?.platformFeeKobo ?? Math.round(rawValueKobo * 0.1);

  // Proof photos
  const beforePhotos: string[] = [];
  const afterPhotos: string[] = [];
  if (detail.proofs) {
    for (const p of detail.proofs) {
      if (p.url) {
        if (p.type === "BEFORE") beforePhotos.push(p.url);
        else afterPhotos.push(p.url);
      }
    }
  }

  // Dispute mapping
  let disputeDetailsMapped = undefined;
  if (detail.dispute) {
    disputeDetailsMapped = {
      raisedBy: detail.dispute.raisedBy || "CUSTOMER",
      reason: detail.dispute.reason || "Dispute opened on booking",
      customerClaim: detail.dispute.customerClaim || "Customer filed arbitration.",
      workerRebuttal: detail.dispute.workerRebuttal,
      createdAt: detail.dispute.createdAt
        ? new Date(detail.dispute.createdAt).toLocaleString("en-GB")
        : "Recently",
      status: detail.dispute.status === "RESOLVED" ? ("RESOLVED" as const) : ("OPEN" as const),
      evidencePhotos: detail.dispute.evidencePhotos || [],
      resolutionProposal: detail.dispute.resolutionProposal,
    };
  } else if (item.disputeCases && item.disputeCases.length > 0) {
    disputeDetailsMapped = {
      raisedBy: "CUSTOMER" as const,
      reason: "Open dispute case on file",
      customerClaim: "Arbitration requested.",
      createdAt: "Recently",
      status: "OPEN" as const,
      evidencePhotos: [],
    };
  }

  // Format posted date
  const postedDateFormatted = item.postedAt
    ? new Date(item.postedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Activity log mapping
  const activityLogMapped = detail.events
    ? detail.events.map((e) => ({
        id: e.id,
        timestamp: e.timestamp
          ? new Date(e.timestamp).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently",
        action: e.action,
        actor: e.actor,
        details: e.details,
      }))
    : undefined;

  return {
    id: item.id,
    bookingId: item.bookingId || null,
    title: item.title || "Marketplace Job",
    customer: {
      id: item.customer?.id || "",
      code: custCode,
      name: custName,
      avatarUrl: item.customer?.avatarUrl,
      phone: item.customer?.phone || "—",
      email: item.customer?.email || "—",
    },
    worker: workerMapped,
    trade: item.trade || "General Trade",
    location: item.location || "Lagos, Nigeria",
    value: valueNaira,
    paymentStatus: item.paymentStatus || "IN_ESCROW",
    deliveryStatus: item.deliveryStatus || "IN_PROGRESS",
    postedDate: postedDateFormatted,
    scheduledDate: detail.scheduledDate,
    completedDate: detail.completedDate,
    needsAttention: Boolean(item.needsAttention),
    attentionReason: attentionReasonMapped,
    attentionDescription:
      item.attentionReasons && item.attentionReasons.length > 0
        ? item.attentionReasons.join(", ")
        : undefined,
    description: detail.description,
    escrowDetails: {
      totalKobo: rawValueKobo,
      workerPayoutKobo,
      platformFeeKobo,
      escrowLockedAt: detail.escrow?.escrowLockedAt || item.postedAt,
      escrowReleasedAt: detail.escrow?.escrowReleasedAt,
      gatewayRef: detail.escrow?.gatewayRef,
    },
    proofOfWork:
      beforePhotos.length > 0 || afterPhotos.length > 0
        ? {
            beforePhotos,
            afterPhotos,
          }
        : undefined,
    disputeDetails: disputeDetailsMapped,
    activityLog: activityLogMapped,
  };
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * 1. List and filter jobs table with attention counts
 * GET /api/v1/admin/jobs
 */
export async function getAdminJobsApi(
  params?: GetAdminJobsQueryParams
): Promise<BackendAdminJobsListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.cursor) queryParams.cursor = params.cursor;
  if (params?.q) queryParams.q = params.q.trim();
  if (params?.status) queryParams.status = params.status;
  if (params?.payment) queryParams.payment = params.payment;
  if (params?.trade) queryParams.trade = params.trade.trim();
  if (params?.location) queryParams.location = params.location.trim();
  if (typeof params?.needsAttention === "boolean") {
    queryParams.needsAttention = params.needsAttention;
  }

  return apiClient.get<BackendAdminJobsListResponse>("/admin/jobs", {
    params: queryParams,
  });
}

/**
 * 2. Get full job or booking detail
 * GET /api/v1/admin/jobs/{id}
 */
export async function getAdminJobDetailApi(
  id: string
): Promise<BackendAdminJobDetailResponse> {
  return apiClient.get<BackendAdminJobDetailResponse>(`/admin/jobs/${encodeURIComponent(id)}`);
}

/**
 * 3. Get short-lived admin download URL for booking media
 * GET /api/v1/admin/jobs/{bookingId}/media/{mediaId}/url
 */
export async function getAdminJobMediaUrlApi(
  bookingId: string,
  mediaId: string
): Promise<{ url: string; expiresIn: number | null }> {
  return apiClient.get<{ url: string; expiresIn: number | null }>(
    `/admin/jobs/${encodeURIComponent(bookingId)}/media/${encodeURIComponent(mediaId)}/url`
  );
}

/**
 * 4. Force release funded escrow
 * POST /api/v1/admin/bookings/{id}/release
 */
export async function forceReleaseEscrowApi(
  bookingId: string,
  payload: ForceReleaseEscrowPayload
): Promise<{ message?: string; success?: boolean }> {
  return apiClient.post<{ message?: string; success?: boolean }>(
    `/admin/bookings/${encodeURIComponent(bookingId)}/release`,
    payload
  );
}

/**
 * 5. Refund escrow to customer
 * POST /api/v1/admin/bookings/{id}/refund
 */
export async function refundEscrowApi(
  bookingId: string,
  payload: RefundEscrowPayload
): Promise<RefundEscrowResponse> {
  return apiClient.post<RefundEscrowResponse>(
    `/admin/bookings/${encodeURIComponent(bookingId)}/refund`,
    payload
  );
}

/**
 * 6. Emergency worker reassignment
 * POST /api/v1/admin/bookings/{id}/reassign
 */
export async function reassignBookingWorkerApi(
  bookingId: string,
  payload: ReassignWorkerPayload
): Promise<{ message?: string; success?: boolean }> {
  return apiClient.post<{ message?: string; success?: boolean }>(
    `/admin/bookings/${encodeURIComponent(bookingId)}/reassign`,
    payload
  );
}

/**
 * 7. Dispute arbitration resolution
 * POST /api/v1/admin/bookings/{id}/arbitration
 */
export async function arbitrateBookingDisputeApi(
  bookingId: string,
  payload: ArbitrateDisputePayload
): Promise<ArbitrateDisputeResponse> {
  return apiClient.post<ArbitrateDisputeResponse>(
    `/admin/bookings/${encodeURIComponent(bookingId)}/arbitration`,
    payload
  );
}
