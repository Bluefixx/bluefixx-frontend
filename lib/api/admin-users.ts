import { apiClient } from "./client";
import { AdminUser, AdminUserRole, AdminVerificationStatus, AdminAccountStatus } from "@/features/admin/types";

// ============================================================================
// Backend Data Contracts (from Admin Users Console — API contract)
// ============================================================================

export type BackendAccountRole = "CUSTOMER" | "ARTISAN" | "TALENT" | "ADMIN";
export type BackendAccountStatus = "ACTIVE" | "DISABLED" | "SUSPENDED";
export type BackendVerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "unverified";

export interface BackendArtisanSummary {
  area?: string;
  trade?: string;
  approval?: string;
  identityStatus?: string;
  completedJobs?: number;
  ratingTotal?: number;
  ratingCount?: number;
}

export interface BackendWalletSummary {
  available: string; // integer kobo string, e.g. "54000000"
  reserved: string;  // integer kobo string, e.g. "20000000"
}

export interface BackendAccountCounts {
  Booking_customerId?: number;
  Booking_artisanId?: number;
  jobPosts?: number;
  SupportCase_userId?: number;
  Notification_userId?: number;
}

export interface BackendAdminAccountItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: BackendAccountRole;
  roles?: BackendAccountRole[];
  accountStatus: BackendAccountStatus;
  verificationStatus: BackendVerificationStatus;
  createdAt: string;
  location?: string;
  artisan?: BackendArtisanSummary;
  wallet?: BackendWalletSummary;
  tags?: string[];
  payoutFrozen?: boolean;
  payoutReason?: string | null;
  lastActiveAt?: string | null;
  disabledAt?: string | null;
  counts?: BackendAccountCounts;
}

export interface BackendAdminAccountsListResponse {
  items: BackendAdminAccountItem[];
  totalCount: number;
  nextCursor: string | null;
}

export interface BackendAdminAccountDetailResponse extends BackendAdminAccountItem {
  profile?: {
    bio?: string;
    avatarUrl?: string;
    nin?: string;
    bvn?: string;
  };
  savedAddresses?: Array<{
    id: string;
    street?: string;
    city?: string;
    state?: string;
    isDefault?: boolean;
  }>;
  payoutAccount?: {
    bankName?: string;
    accountNumberMasked?: string;
    accountName?: string;
    isApproved?: boolean;
  };
  notes?: Array<{
    id: string;
    authorId: string;
    author?: string;
    text: string;
    createdAt: string;
  }>;
  bookings?: Array<{
    id: string;
    code?: string;
    title?: string;
    status: string;
    totalAmountKobo?: string | number;
    createdAt: string;
    counterpartyName?: string;
  }>;
  jobs?: Array<{
    id: string;
    title: string;
    status: string;
    budgetKobo?: string | number;
    createdAt: string;
  }>;
  payments?: Array<{
    id: string;
    reference: string;
    amountKobo: string;
    status: string;
    channel: string;
    createdAt: string;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    reviewerName?: string;
    createdAt: string;
  }>;
  transfers?: Array<{
    id: string;
    reference: string;
    amountKobo: string;
    status: string;
    createdAt: string;
  }>;
  cases?: Array<{
    id: string;
    ticketNumber?: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  disputes?: Array<{
    id: string;
    disputeCode?: string;
    title: string;
    status: string;
    amountKobo?: string;
    createdAt: string;
  }>;
  audits?: Array<{
    id: string;
    action: string;
    adminName?: string;
    details?: string;
    timestamp?: string;
    createdAt?: string;
  }>;
}

export interface BackendAdminIdentityEvidence {
  id: string;
  userId: string;
  nin?: string;
  bvn?: string;
  idCardUrl?: string;
  selfieUrl?: string;
  proofOfAddressUrl?: string;
  tradeCertificateUrl?: string;
  status: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  notes?: string;
}

// Filter query parameters for GET /admin/accounts
export interface GetAdminAccountsQueryParams {
  cursor?: string;
  limit?: number; // 1-100, default 30
  q?: string;     // Name, email, or phone
  role?: "CUSTOMER" | "ARTISAN" | "TALENT" | "ADMIN";
  status?: "active" | "disabled";
  verification?: "VERIFIED" | "PENDING" | "UNDER_REVIEW" | "REJECTED" | "unverified";
  location?: string;
}

// Request payloads
export interface UpdateAccountStatusPayload {
  enabled: boolean;
  reason: string; // 5-2000 chars
}

export interface SendAccountNotificationPayload {
  userIds: string[];
  title: string;
  message: string;
  channel?: "IN_APP" | "EMAIL" | "SMS" | "ALL";
  priority?: "NORMAL" | "HIGH" | "URGENT";
}

export interface UpdatePayoutHoldPayload {
  enabled: boolean;
  reason: string; // 5-2000 chars
}

export interface UpdateAccountTagsPayload {
  tags: string[]; // max 30 tags
}

export interface AddAccountNotePayload {
  text: string; // max 4000 chars
}

export interface AdjustWalletBalancePayload {
  direction: "CREDIT" | "DEBIT";
  amountKobo: number; // positive integer kobo
  reason: string;     // 5-2000 chars
}

// ============================================================================
// Data Mapper: Backend Payload -> Frontend AdminUser
// ============================================================================

export function mapBackendAccountToAdminUser(
  item: BackendAdminAccountItem | BackendAdminAccountDetailResponse
): AdminUser {
  // 1. Role mapping: backend ARTISAN corresponds to frontend WORKER label
  let mappedRole: AdminUserRole = "CUSTOMER";
  if (item.role === "ARTISAN") {
    mappedRole = "WORKER";
  } else if (item.role === "TALENT") {
    mappedRole = "TALENT";
  } else {
    mappedRole = "CUSTOMER";
  }

  // 2. Verification status mapping
  let mappedVerification: AdminVerificationStatus = "PENDING";
  const rawVerif = (item.verificationStatus || "").toUpperCase();
  if (rawVerif === "VERIFIED") mappedVerification = "VERIFIED";
  else if (rawVerif === "UNDER_REVIEW") mappedVerification = "UNDER_REVIEW";
  else if (rawVerif === "REJECTED") mappedVerification = "REJECTED";
  else mappedVerification = "PENDING";

  // 3. Account status mapping
  let mappedAccountStatus: AdminAccountStatus = "ACTIVE";
  const rawStatus = (item.accountStatus || "").toUpperCase();
  if (rawStatus === "DISABLED" || rawStatus === "SUSPENDED" || item.disabledAt) {
    mappedAccountStatus = "SUSPENDED";
  } else {
    mappedAccountStatus = "ACTIVE";
  }

  // 4. Wallet balances
  const availableKobo = item.wallet?.available ? parseInt(item.wallet.available, 10) : 0;
  const reservedKobo = item.wallet?.reserved ? parseInt(item.wallet.reserved, 10) : 0;

  // 5. Rating & jobs
  const completedJobs =
    item.artisan?.completedJobs ??
    item.counts?.Booking_artisanId ??
    item.counts?.Booking_customerId ??
    0;

  const ratingCount = item.artisan?.ratingCount ?? 0;
  const ratingTotal = item.artisan?.ratingTotal ?? 0;
  const avgRating = ratingCount > 0 ? Number((ratingTotal / ratingCount).toFixed(1)) : 5.0;

  // 6. User Code (Backend uses UUID id; derive readable code or extract from profile)
  const shortCode = `U-${item.id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  // 7. Last Active & Joined dates
  const joinedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const lastActiveFormatted = item.lastActiveAt
    ? new Date(item.lastActiveAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Check detail-specific fields if available
  const detail = item as BackendAdminAccountDetailResponse;
  const bankAccount = detail.payoutAccount
    ? {
        bankName: detail.payoutAccount.bankName || "Commercial Bank",
        accountNumber: detail.payoutAccount.accountNumberMasked || "•••• ••••",
        accountName: detail.payoutAccount.accountName || item.fullName,
        isApproved: Boolean(detail.payoutAccount.isApproved),
      }
    : undefined;

  const internalNotes = detail.notes
    ? detail.notes.map((n) => ({
        id: n.id,
        author: n.author || "Admin",
        text: n.text,
        createdAt: n.createdAt
          ? new Date(n.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Just now",
      }))
    : undefined;

  return {
    id: item.id,
    userCode: shortCode,
    fullName: item.fullName || "Unnamed User",
    email: item.email || "",
    phone: item.phone || "",
    location: item.location || item.artisan?.area || "Lagos, Nigeria",
    role: mappedRole,
    trade: item.artisan?.trade,
    verificationStatus: mappedVerification,
    accountStatus: mappedAccountStatus,
    avatarUrl: detail.profile?.avatarUrl,
    lastActive: lastActiveFormatted,
    joinedAt: joinedDate,
    walletBalanceKobo: isNaN(availableKobo) ? 0 : availableKobo,
    escrowBalanceKobo: isNaN(reservedKobo) ? 0 : reservedKobo,
    completedJobsCount: completedJobs,
    rating: avgRating,
    ratingCount,
    nin: detail.profile?.nin,
    bvnVerified: Boolean(detail.profile?.bvn),
    bankAccount,
    suspensionReason: (item as any).suspensionReason || undefined,
    suspendedAt: item.disabledAt || undefined,
    internalNotes,
    payoutsFrozen: Boolean(item.payoutFrozen),
    tags: Array.isArray(item.tags) ? item.tags : [],
    disputeCount: detail.disputes?.length ?? 0,
  };
}

// ============================================================================
// API Client Functions (All route under /admin/accounts or /admin/artisans)
// ============================================================================

/**
 * 1. List, filter, and paginate accounts
 * GET /api/v1/admin/accounts
 */
export async function getAdminAccountsApi(
  params?: GetAdminAccountsQueryParams
): Promise<BackendAdminAccountsListResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.cursor) queryParams.cursor = params.cursor;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.q) queryParams.q = params.q.trim();
  if (params?.role) queryParams.role = params.role;
  if (params?.status) queryParams.status = params.status;
  if (params?.verification) queryParams.verification = params.verification;
  if (params?.location) queryParams.location = params.location.trim();

  return apiClient.get<BackendAdminAccountsListResponse>("/admin/accounts", {
    params: queryParams,
  });
}

/**
 * 2. Get an account profile and activity
 * GET /api/v1/admin/accounts/{id}
 */
export async function getAdminAccountDetailApi(
  id: string
): Promise<BackendAdminAccountDetailResponse> {
  return apiClient.get<BackendAdminAccountDetailResponse>(`/admin/accounts/${encodeURIComponent(id)}`);
}

/**
 * 3. Suspend or reactivate an account
 * PATCH /api/v1/admin/accounts/{id}/status
 */
export async function updateAdminAccountStatusApi(
  id: string,
  payload: UpdateAccountStatusPayload
): Promise<{ id: string; accountStatus: string; disabledAt: string | null }> {
  return apiClient.patch<{ id: string; accountStatus: string; disabledAt: string | null }>(
    `/admin/accounts/${encodeURIComponent(id)}/status`,
    payload
  );
}

/**
 * 4. Send an account notification
 * POST /api/v1/admin/accounts/notifications
 */
export async function sendAdminAccountNotificationApi(
  payload: SendAccountNotificationPayload
): Promise<{
  recipientCount: number;
  delivery: Record<string, number>;
  failed: Record<string, number>;
}> {
  return apiClient.post<{
    recipientCount: number;
    delivery: Record<string, number>;
    failed: Record<string, number>;
  }>("/admin/accounts/notifications", payload);
}

/**
 * 5. Freeze or restore withdrawals (Payout Hold)
 * PATCH /api/v1/admin/accounts/{id}/payout-hold
 */
export async function updateAdminAccountPayoutHoldApi(
  id: string,
  payload: UpdatePayoutHoldPayload
): Promise<{ payoutFrozen: boolean; payoutReason: string | null }> {
  return apiClient.patch<{ payoutFrozen: boolean; payoutReason: string | null }>(
    `/admin/accounts/${encodeURIComponent(id)}/payout-hold`,
    payload
  );
}

/**
 * 6. Update admin tags
 * PATCH /api/v1/admin/accounts/{id}/tags
 */
export async function updateAdminAccountTagsApi(
  id: string,
  payload: UpdateAccountTagsPayload
): Promise<{ tags: string[] }> {
  return apiClient.patch<{ tags: string[] }>(
    `/admin/accounts/${encodeURIComponent(id)}/tags`,
    payload
  );
}

/**
 * 7. Add a private note
 * POST /api/v1/admin/accounts/{id}/notes
 */
export async function createAdminAccountNoteApi(
  id: string,
  payload: AddAccountNotePayload
): Promise<{ id: string; authorId: string; text: string; createdAt: string; author?: string }> {
  return apiClient.post<{ id: string; authorId: string; text: string; createdAt: string; author?: string }>(
    `/admin/accounts/${encodeURIComponent(id)}/notes`,
    payload
  );
}

/**
 * 8. Revoke all active sessions
 * POST /api/v1/admin/accounts/{id}/sessions/revoke
 */
export async function revokeAdminAccountSessionsApi(
  id: string
): Promise<{ revokedSessions: number }> {
  return apiClient.post<{ revokedSessions: number }>(
    `/admin/accounts/${encodeURIComponent(id)}/sessions/revoke`,
    {}
  );
}

/**
 * 9. Initiate password recovery
 * POST /api/v1/admin/accounts/{id}/password-reset
 */
export async function resetAdminAccountPasswordApi(
  id: string
): Promise<{ success: boolean; message?: string }> {
  return apiClient.post<{ success: boolean; message?: string }>(
    `/admin/accounts/${encodeURIComponent(id)}/password-reset`,
    {}
  );
}

/**
 * 10. Adjust a wallet balance (Credit / Debit)
 * POST /api/v1/admin/accounts/{id}/wallet-adjustments
 */
export async function adjustAdminAccountWalletApi(
  id: string,
  payload: AdjustWalletBalancePayload
): Promise<{ available: string; reserved: string }> {
  return apiClient.post<{ available: string; reserved: string }>(
    `/admin/accounts/${encodeURIComponent(id)}/wallet-adjustments`,
    payload
  );
}

/**
 * 11. Get artisan identity evidence
 * GET /api/v1/admin/artisans/{id}/identity
 */
export async function getAdminArtisanIdentityApi(
  id: string
): Promise<BackendAdminIdentityEvidence> {
  return apiClient.get<BackendAdminIdentityEvidence>(
    `/admin/artisans/${encodeURIComponent(id)}/identity`
  );
}
