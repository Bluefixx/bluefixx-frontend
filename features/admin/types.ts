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

// ==========================================
// Disputes, Support & Safety Contracts
// ==========================================

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "AWAITING_RESPONSE" | "ESCALATED" | "RESOLVED";
export type DisputePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DisputeParty {
  id: string;
  name: string;
  code: string;
  role: "CUSTOMER" | "WORKER";
  avatarUrl?: string;
  phone?: string;
  email?: string;
  totalJobs: number;
  rating?: number;
  lifetimeSpendOrEarned: number;
  pastDisputesCount: number;
  cancelledJobsCount?: number;
  status: "ACTIVE" | "SUSPENDED" | "FLAGGED";
  payoutsFrozen?: boolean;
}

export interface DisputeEvidenceAttachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  sizeBytes?: number;
  uploader: string;
  description?: string;
  isAfterProof?: boolean;
  type?: "photo" | "document" | "video";
}

export interface DisputeMessage {
  id: string;
  author: {
    name: string;
    role: "CUSTOMER" | "WORKER" | "ADMIN";
    avatarUrl?: string;
  };
  timestamp: string;
  content: string;
  attachments?: DisputeEvidenceAttachment[];
  isInternalAdminNote?: boolean;
}

export interface DisputeTimelineEvent {
  title: string;
  date: string;
  description?: string;
  completed: boolean;
  active?: boolean;
}

export interface AdminDispute {
  id: string;
  title: string;
  jobId: string;
  jobTitle: string;
  transactionId: string;
  escrowAmount: number;
  openedDate: string;
  priority: DisputePriority;
  status: DisputeStatus;
  assignedAdmin: string;
  customer: DisputeParty;
  worker: DisputeParty;
  resolutionOutcome?: "FULL_WORKER" | "FULL_CUSTOMER" | "SPLIT_AGREED" | "NO_EVIDENCE";
  resolutionSplit?: {
    workerPercentage: number;
    customerPercentage: number;
    workerAmount: number;
    customerAmount: number;
    platformFee: number;
  };
  resolutionReason?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  refundDebitMemoId?: string;
  messages: DisputeMessage[];
  evidenceFiles: DisputeEvidenceAttachment[];
  timeline: DisputeTimelineEvent[];
}

export interface AdminSupportTicket {
  id: string;
  user: {
    name: string;
    role: "Customer" | "Worker" | "Talent";
    avatarUrl?: string;
    code: string;
  };
  subject: string;
  category: "Withdrawal" | "Payments" | "Dispute" | "Verification" | "Account Safety" | "Apprenticeship" | "Reviews" | "Programmes";
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Waiting for user" | "Resolved";
  assignedAdmin: string;
  createdAt: string;
  waitTime: string;
  isBreachedSLA: boolean;
  slaRemainingMinutes?: number;
  lastMessageSnippet: string;
  jobId?: string;
  transactionId?: string;
}

export interface AdminSafetyIncident {
  id: string;
  party: {
    name: string;
    code: string;
    role: "Customer" | "Worker" | "Talent";
  };
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: "Conduct" | "Damage" | "Theft" | "Harassment" | "Safety";
  jobId?: string;
  status: "Open" | "Investigating" | "Resolved" | "Escalated";
  assignedAdmin: string;
  reportedDate: string;
  description: string;
  location: string;
  isCriticalAlert?: boolean;
}

// ==========================================
// Reviews & Ratings Module Contracts
// ==========================================

export type ReviewReportStatus = "Reported" | "Under Review" | "Clean" | "Hidden";

export interface AdminReview {
  id: string;
  stars: number;
  reviewText: string;
  subAnnotation?: string;
  patternTag?: string;
  reviewerName: string;
  reviewerRole: "Customer" | "Worker" | "Anonymous";
  reviewerId: string;
  reviewerAvatarUrl?: string;
  reviewedUserName: string;
  reviewedUserId: string;
  reviewedUserRole: "Worker" | "Talent" | "Customer";
  reviewedUserAvatarUrl?: string;
  jobId: string;
  jobTitle?: string;
  trade: string;
  date: string;
  reportStatus: ReviewReportStatus;
  flagReason?: string;
  moderationNotes?: string;
  isSuspiciousVelocity?: boolean;
  linkedDisputeId?: string;
  linkedSafetyIncidentId?: string;
}

// ==========================================
// Talents & Apprenticeship Module Contracts
// ==========================================

export interface AdminTalentApplication {
  id: string;
  talentName: string;
  talentId: string;
  avatarUrl?: string;
  trade: string;
  programme: string;
  programmeId: string;
  location: string;
  appliedDate: string;
  status: "In Review" | "Shortlisted" | "Verified" | "Rejected";
  phone: string;
  email: string;
  education: string;
  motivation: string;
  experience: string;
  refereeName?: string;
  refereeContact?: string;
}

export interface AdminActiveTalent {
  id: string;
  talentName: string;
  talentId: string;
  avatarUrl?: string;
  trade: string;
  programme: string;
  programmeId: string;
  masterArtisanName: string;
  masterArtisanId: string;
  progressPercent: number;
  currentMonth: number;
  totalMonths: number;
  enrolledDate: string;
  status: "Active" | "Pending Completion" | "On Hold";
  location: string;
}

export interface AdminMasterArtisan {
  id: string;
  name: string;
  userId: string;
  avatarUrl?: string;
  trade: string;
  location: string;
  rating: number;
  ratingCount: number;
  completedJobsCount: number;
  verifiedApprenticesCount: number;
  activeApprenticesCount: number;
  activeProgrammesCount: number;
  totalRevenueKobo: number;
  status: "Active" | "Pending Review" | "Suspended";
}

export interface AdminApprenticeshipProgramme {
  id: string;
  title: string;
  cohort: string;
  trade: string;
  masterArtisanName: string;
  masterArtisanId: string;
  duration: string;
  capacity: number;
  enrolledCount: number;
  feeKobo: number;
  location: string;
  status: "Active" | "Full" | "Upcoming" | "Completed";
  startDate: string;
}

export interface AdminTalentCertification {
  id: string;
  talentName: string;
  talentId: string;
  trade: string;
  programme: string;
  cohort: string;
  masterArtisanName: string;
  completedDate: string;
  status: "Certified" | "Pending" | "In Progress" | "Revoked";
  issuedAt?: string;
  issuedBy?: string;
  certificateCode?: string;
}

export interface AdminApprenticeshipPayment {
  id: string;
  talentName: string;
  talentId: string;
  programme: string;
  masterArtisanName: string;
  slot: string;
  totalFeeKobo: number;
  paidAmountKobo: number;
  outstandingAmountKobo: number;
  nextDue: string;
  status: "Paid in full" | "In Escrow" | "Overdue" | "Pending release" | "Partial";
  lastPaidDate?: string;
}

// ==========================================
// Platform Management Modules Contracts
// ==========================================

export interface AdminTradeSubcategory {
  name: string;
  slug: string;
  rank: number;
}

export interface AdminTradeCategory {
  id: string;
  name: string;
  subcategories: string[];
  subcategoryDetails?: AdminTradeSubcategory[];
  warrantyDays?: number;
  activeWorkers: number;
  jobs30d: number;
  demand: "High" | "Medium" | "Low";
  avgJobValueKobo: number;
  jobsPerWorker: number;
  status: "Active" | "Inactive";
  commissionOverride?: string;
  verificationRequirements?: string[];
  deactivationReason?: string;
}

export type ContentKind = "FAQ" | "TESTIMONIAL" | "ANNOUNCEMENT";
export type ContentAudienceScope = "ALL" | "WORKERS_ONLY" | "CUSTOMERS_ONLY" | "TALENTS_ONLY";

export interface AdminContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  snippet?: string;
  content: string;
  category?: string;
  authorName?: string;
  authorRole?: string;
  targetAudience: string;
  audienceScope?: ContentAudienceScope;
  status: "Published" | "Pending review" | "Draft" | "Pending" | "Expired";
  updatedAt: string;
  scheduledDate?: string;
  expiresAt?: string;
}

export interface AdminNotificationTemplate {
  id: string;
  title: string;
  subject: string;
  audience: string;
  segmentFilter: string;
  channels: string[];
  message: string;
  callToAction?: string;
}

export interface AdminBroadcastNotification {
  id: string;
  subject: string;
  message: string;
  audience: string;
  segmentFilter: string;
  channels: string[];
  callToAction?: string;
  delivery: string;
  sentAt: string;
  deliveredCount: number;
  failedCount: number;
  status: "Successful" | "Pending" | "Failed";
}

export type AdminRoleType =
  | "Super Administrator"
  | "Finance Admin"
  | "Support Lead"
  | "Operations Admin"
  | "Verification Admin"
  | "Support Agent"
  | "Compliance Lead";

export type AdminMfaStatus = "ENFORCED" | "PENDING_SETUP" | "DISABLED";

export interface AdminRoleUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: AdminRoleType;
  status: "Active" | "Invited" | "Suspended";
  mfaStatus: AdminMfaStatus;
  mfaMethod?: "AUTHENTICATOR_APP" | "SMS_2FA";
  lastActive: string;
  permissions?: string[];
}

export interface AdminAuditLog {
  id: string;
  dateTime: string;
  adminName: string;
  action: string;
  isSensitive: boolean;
  object: string;
  objectId: string;
  change: string;
  ipAddress?: string;
  reason?: string;
}

// ==========================================
// Referrals & Growth Engine Contracts
// ==========================================

export interface AdminReferralItem {
  id: string;
  referrerName: string;
  referrerRole: "Worker" | "Customer" | "Talent";
  referredName: string;
  referredRole: "Worker" | "Customer" | "Talent";
  date: string;
  conversionStatus: "Converted" | "Pending" | "Suspended";
  rewardKobo: number;
  payoutStatus: "Paid" | "Pending" | "Withheld";
  relatedActivity: string;
  trade?: string;
  tierBadge?: "Priority Trade (₦3k)" | "Standard (₦1.5k–₦2k)";
  deviceFingerprint?: string;
  ipAddress?: string;
  fraudFlagReason?: string;
}

export interface ReferralFraudRules {
  maxAccountsPerDevice: number;
  maxReferralsPer24h: number;
  autoHoldOnVpn: boolean;
  requireFirstJobCompleted: boolean;
}

// ==========================================
// Platform Settings Contracts
// ==========================================

export interface AdminPlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    defaultRegion: string;
  };
  marketplace: {
    requireVerificationBeforeMatching: boolean;
    allowCustomerInviteSpecificWorker: boolean;
    minimumJobValueKobo: number;
    freeCancellationWindowHours: number;
  };
  payments: {
    standardCommissionRate: number;
    singleTransactionLimitKobo: number;
    autoReleaseEscrowOnCustomerConfirmation: boolean;
    splitFeeForPreWorkDrawingOrMaterial: boolean;
  };
  withdrawals: {
    minimumWithdrawalKobo: number;
    manualApprovalThresholdKobo: number;
    payoutBank: string;
    transactionPinRequired: "ALWAYS" | "OVER_THRESHOLD" | "DISABLED";
  };
  refunds: {
    requireReasonOnEveryRefund: boolean;
    removePlatformFeeOnFullRefunds: boolean;
    refundRequestWindowHours: number;
  };
  security: {
    enforceMfaForAllAdmins: boolean;
    sessionTimeoutMinutes: number;
    alertOnSensitiveActionOutsideWorkingHours: boolean;
    maintenanceModeActive: boolean;
  };
}

export interface AdminScheduledReport {
  id: string;
  name: string;
  frequency: "WEEKLY" | "MONTHLY" | "DAILY";
  dayOfWeek?: string;
  time: string;
  recipients: string[];
  sections: string[];
  lastSent?: string;
  status: "ACTIVE" | "PAUSED";
}

