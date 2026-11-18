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
