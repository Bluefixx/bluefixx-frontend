export type AdminUserRole = "WORKER" | "CUSTOMER" | "TALENT";
export type AdminVerificationStatus = "VERIFIED" | "PENDING" | "UNDER_REVIEW" | "REJECTED";
export type AdminAccountStatus = "ACTIVE" | "SUSPENDED" | "DORMANT";

export interface AdminInternalNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AdminUserDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
}

export interface AdminUser {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: AdminUserRole;
  trade?: string;
  verificationStatus: AdminVerificationStatus;
  accountStatus: AdminAccountStatus;
  avatarUrl?: string;
  lastActive: string;
  joinedAt: string;
  walletBalanceKobo: number;
  escrowBalanceKobo: number;
  completedJobsCount: number;
  rating: number;
  ratingCount: number;
  nin?: string;
  bvnVerified?: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    isApproved: boolean;
  };
  suspensionReason?: string;
  suspensionCategory?: string;
  suspendedAt?: string;
  documents?: AdminUserDocument[];
  internalNotes?: AdminInternalNote[];
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  riskFlags?: string[];
  disputeCount?: number;
  disputeRatePercent?: number;
  payoutsFrozen?: boolean;
  customCommissionRate?: number;
  dailyWithdrawalLimitKobo?: number;
  tags?: string[];
}

export interface AttentionItem {
  id: string;
  count: number;
  title: string;
  description: string;
  level: "critical" | "high" | "monitor";
  actionText: string;
  href: string;
}

export interface MarketplaceHealthKPI {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  highlight?: boolean;
}

export interface SensitiveAdminAction {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  reference: string;
  status: "Approved" | "Suspended" | "Processed" | "Info";
}

// ==========================================
// Jobs Module Data Contracts
// ==========================================

export type JobPaymentStatus =
  | "IN_ESCROW"
  | "HOLDING"
  | "RELEASED"
  | "DISPUTED"
  | "REFUNDED"
  | "FAILED";

export type JobDeliveryStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "POSTED"
  | "DISPUTED"
  | "CANCELLED"
  | "PENDING";

export type JobAttentionReason =
  | "OVERDUE_DELIVERY"
  | "FAILED_ESCROW"
  | "WORKER_SUSPENDED"
  | "STALLED_ESCROW"
  | "DISPUTED";

export interface AdminJob {
  id: string;
  title: string;
  customer: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
    phone: string;
    email: string;
  };
  worker?: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
    phone: string;
    trade: string;
    isSuspended?: boolean;
  };
  trade: string;
  location: string;
  address?: string;
  value: number;
  paymentStatus: JobPaymentStatus;
  deliveryStatus: JobDeliveryStatus;
  postedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  needsAttention?: boolean;
  attentionReason?: JobAttentionReason;
  attentionDescription?: string;
  description?: string;
  escrowDetails: {
    totalKobo: number;
    workerPayoutKobo: number;
    platformFeeKobo: number;
    escrowLockedAt?: string;
    escrowReleasedAt?: string;
    gatewayRef?: string;
  };
  proofOfWork?: {
    beforePhotos: string[];
    afterPhotos: string[];
    notes?: string;
    submittedAt?: string;
  };
  disputeDetails?: {
    raisedBy: "CUSTOMER" | "WORKER";
    reason: string;
    customerClaim: string;
    workerRebuttal?: string;
    createdAt: string;
    status: "OPEN" | "RESOLVED";
    evidencePhotos: string[];
    resolutionProposal?: string;
  };
  activityLog?: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }[];
}

// ==========================================
// Worker Verification Module Data Contracts
// ==========================================

export type VerificationCaseStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "REQUIRES_INFO"
  | "REJECTED"
  | "APPROVED";

export type VerificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface VerificationDocument {
  id: string;
  type: "NIN" | "TRADE_CERT" | "GUARANTOR" | "PORTFOLIO";
  name: string;
  status: "VALID" | "FLAGGED" | "PENDING";
  url: string;
  submittedAt: string;
  flagReason?: string;
}

export interface WorkerVerificationCase {
  id: string;
  worker: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
    phone: string;
    email: string;
    trade: string;
    location: string;
    address?: string;
    experienceYears: number;
    registeredDate: string;
    jobsCompleted: number;
    rating: number;
    lifetimeEarnings: number;
  };
  status: VerificationCaseStatus;
  priority: VerificationPriority;
  submittedAt: string;
  assignedReviewer: string;
  documents: VerificationDocument[];
  history: {
    date: string;
    event: string;
    author: string;
  }[];
}

// ==========================================
// Transactions & Finance Module Data Contracts
// ==========================================

export type FinancePaymentMethod = "Card — Paystack" | "Bank transfer" | "Wallet balance";

export interface AdminTransaction {
  id: string;
  customer: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
  };
  worker: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
    trade: string;
  };
  job: {
    id: string;
    title: string;
    trade: string;
    location: string;
    deliveryStatus: string;
  };
  grossAmount: number;
  platformFee: number;
  workerEarnings: number;
  method: FinancePaymentMethod;
  status: JobPaymentStatus;
  date: string;
  gatewayRef: string;
  timeline: {
    paymentInitiated?: string;
    fundsHeldInEscrow?: string;
    jobCompleted?: string;
    payoutReleased?: string;
    refundIssued?: string;
  };
  refundHistory?: {
    id: string;
    amount: number;
    reason: string;
    date: string;
    admin: string;
    status: "Processed" | "Pending" | "Rejected";
  }[];
  auditHistory: {
    id: string;
    action: string;
    actor: string;
    date: string;
  }[];
  flags?: string[];
}

export interface AdminWithdrawal {
  id: string;
  worker: {
    id: string;
    code: string;
    name: string;
    avatarUrl?: string;
    trade: string;
  };
  amount: number;
  requestedAt: string;
  destinationBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    nameMatchStatus: "MATCH" | "PARTIAL" | "MISMATCH";
  };
  status: "PENDING" | "APPROVED" | "FLAGGED" | "IN_REVIEW" | "COMPLETED" | "REJECTED";
  assignedAdmin: string;
  riskNote?: string;
}

export interface AdminRefund {
  id: string;
  transactionId: string;
  customer: {
    id: string;
    code: string;
    name: string;
  };
  worker: {
    id: string;
    code: string;
    name: string;
  };
  job: {
    id: string;
    title: string;
  };
  amount: number;
  reason: string;
  status: "Processed" | "Pending" | "Rejected";
  admin: string;
  date: string;
}

export interface CommissionTierConfig {
  standardCommissionPercent: number;
  solarCommissionPercent: number;
  apprenticeshipCommissionPercent: number;
  withdrawalFlatFee: number;
  categoryOverrides: { trade: string; percent: number }[];
}

export interface WalletLedgerEntry {
  id: string;
  user: {
    id: string;
    name: string;
    code: string;
    role: string;
  };
  type:
    | "Wallet funding"
    | "Withdrawal payout"
    | "Escrow credit"
    | "Escrow debit"
    | "Admin adjustment"
    | "Commission deduction";
  amount: number;
  status: "Successful" | "Pending" | "Failed";
  date: string;
}
