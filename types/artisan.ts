/**
 * BlueFixx Artisan API TypeScript Definitions
 * Aligned with the BlueFixx Artisan Integration Guide & screen acceptance checklist.
 */

// ── Base Money & Currency ─────────────────────────────────────────
// Integer kobo numbers in requests (e.g., 100000 = ₦1,000.00);
// DB responses return decimal strings (e.g. "100000.00" or "100000").
export type KoboAmount = number;
export type MonetaryString = string;

// ── Common Shared Enums & Types ───────────────────────────────────
export type ArtisanApprovalStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type IdentityMethod = "MANUAL_REVIEW";

export type JobUrgency =
  | "EMERGENCY"
  | "WITHIN_TWO_DAYS"
  | "THIS_WEEK"
  | "FLEXIBLE";

export type JobSortOption =
  | "recommended"
  | "nearest"
  | "newest"
  | "urgent"
  | "highest-budget";

export type DateFilterOption = "any" | "today" | "tomorrow" | "week";

export type MaterialSupplier = "ARTISAN" | "CUSTOMER";

export type OfferStatus =
  | "OPEN"
  | "ACCEPTED"
  | "WITHDRAWN"
  | "DECLINED"
  | "EXPIRED"
  | "SUPERSEDED";

export type BookingStageStatus =
  | "AWAITING_PAYMENT"
  | "ACCEPTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "WORK_SUBMITTED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type TrainingProgramStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TrainingApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "DECLINED";

export type TrainingQuestionType = "TEXT" | "YES_NO" | "FILE";

export type CustomerReviewTag =
  | "CLEAR_BRIEF"
  | "PAID_ON_TIME"
  | "RESPECTFUL"
  | "SAFE_SITE"
  | "EASY_TO_REACH";

export type SafetyIssueType =
  | "UNSAFE_HOME"
  | "AGGRESSIVE_CUSTOMER"
  | "ILLEGAL_REQUEST"
  | "INJURY"
  | "UNEXPECTED_PERSON"
  | "OTHER";

// ── 1. Dashboard & Availability ────────────────────────────────────
export interface ArtisanCapabilities {
  canBrowse: boolean;
  canQuote: boolean;
  canToggleAvailability: boolean;
  restrictionReason?: string | null;
  identityMethod?: IdentityMethod;
}

export interface ArtisanDashboardProfile {
  businessName: string;
  available: boolean;
  approval: ArtisanApprovalStatus;
  ratingCount: number;
  ratingTotal: number;
  avatarUrl?: string;
}

export interface ArtisanTrainingApprentice {
  enrollmentId: string;
  name: string;
  programTitle: string;
  progress: number;
}

export interface ArtisanDashboardTraining {
  applicationsWaiting: number;
  activeApprentices: number;
  apprentices: ArtisanTrainingApprentice[];
}

export interface BankTransfer {
  id: string;
  userId?: string;
  bankId?: string;
  bookingId?: string | null;
  amount: MonetaryString;
  kind?: "WITHDRAWAL" | "ARTISAN";
  status?: string;
  reference?: string;
  createdAt?: string;
}

export interface WithdrawalPolicy {
  enabled?: boolean;
  minimum?: KoboAmount;
  maximum?: KoboAmount;
  dailyMaximum?: KoboAmount;
}

export interface ArtisanEarning {
  id: string;
  kind: "JOB_EARNING" | "TRAINING_EARNING" | "LEGACY_PAYOUT" | "WITHDRAWAL";
  amount: MonetaryString;
  createdAt: string;
  reference: string;
  status: string;
  bookingId: string | null;
  title: string;
}

export interface ArtisanEarningsPolicies {
  feePayer: string;
  withdrawalApproval: string;
  withdrawalFee: MonetaryString;
  providerTransferCostPayer: string;
}

export interface ArtisanEarnings {
  currency: string;
  walletScope: "ACCOUNT";
  available: MonetaryString;
  withdrawalReserved: MonetaryString;
  held: MonetaryString;
  paid: MonetaryString;
  transfers: BankTransfer[];
  lifetimeEarnings: MonetaryString;
  monthlyEarnings: MonetaryString;
  weekly: Array<{ date: string; amount: MonetaryString }>;
  recent: ArtisanEarning[];
  withdrawalPolicy?: WithdrawalPolicy | null;
  policies: ArtisanEarningsPolicies;
}

export interface ArtisanDashboardResponse {
  profile: ArtisanDashboardProfile | null;
  requests: ArtisanJobListItem[];
  activeJobs: ArtisanBookingDetail[];
  completed: number;
  requestCount: number;
  activeJobCount: number;
  rating: number | null;
  unreadMessages: number;
  unreadNotifications: number;
  training: ArtisanDashboardTraining;
  capabilities?: ArtisanCapabilities;
  onboarding?: ArtisanOnboardingResponse;
  earnings: ArtisanEarnings;
  rewards?: Record<string, unknown>;
  recommendedJobs: ArtisanJobListItem[];
  recommendationRestriction: string | null;
}

export interface ArtisanAvailabilityPayload {
  available: boolean;
}

export interface ArtisanAvailabilityResponse {
  available: boolean;
}

// ── 2. Onboarding & Manual Identity Review ────────────────────────
export interface ArtisanStandardService {
  id: string;
  tradeId: string;
  name: string;
  active: boolean;
}

export interface ArtisanTradeWithServices {
  id: string;
  name: string;
  active: boolean;
  services: ArtisanStandardService[];
}

export interface ArtisanPricedServiceItem {
  serviceId: string;
  description: string;
  minimum: KoboAmount;
  maximum: KoboAmount;
}

export interface ArtisanPricedServiceResponse {
  id: string;
  artisanId: string;
  serviceId: string;
  description: string;
  minimum: MonetaryString;
  maximum: MonetaryString;
}

export interface ArtisanOnboardingDraft {
  fullName?: string;
  businessName?: string;
  bio?: string;
  yearsExperience?: number;
  latitude?: number;
  longitude?: number;
  area?: string;
  radiusKm?: number;
  tradeIds?: string[];
  services?: ArtisanPricedServiceItem[];
  identityMediaIds?: string[];
  portfolioIds?: string[];
  portfolio?: Array<{
    id: string;
    url?: string;
    title?: string;
    description?: string;
  }>;
}

export interface ArtisanOnboardingResponse {
  draft: ArtisanOnboardingDraft;
  revision: number;
  steps: string[];
  completedSteps: number;
  totalSteps: number;
  approval: ArtisanApprovalStatus;
  identityStatus: string;
  identitySaved: boolean;
  submittedAt?: string | null;
  feedback?: string | null;
  rejectedSteps?: string[];
  capabilities: ArtisanCapabilities;
  phone?: string;
}

export interface ArtisanOnboardingPatchPayload {
  fullName?: string;
  businessName?: string;
  bio?: string;
  yearsExperience?: number;
  latitude?: number;
  longitude?: number;
  area?: string;
  radiusKm?: number;
  tradeIds?: string[];
  services?: ArtisanPricedServiceItem[];
  nin?: string;
  identityMediaIds?: string[];
  portfolioIds?: string[];
  portfolio?: Array<{
    id: string;
    url?: string;
    title?: string;
    description?: string;
  }>;
}

export interface ArtisanIdentityPayload {
  nin: string; // 11 digits
  mediaIds: string[]; // [govIdPhotoId, selfiePhotoId]
}

// ── 3. Find Jobs, Requests, Questions & Declines ──────────────────
export interface ArtisanJobFilterParams {
  q?: string;
  tradeId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minimumBudget?: KoboAmount;
  urgency?: JobUrgency;
  date?: DateFilterOption;
  sort?: JobSortOption;
  myTrades?: boolean;
  offset?: number;
  limit?: number;
}

export interface ArtisanJobAllowedActions {
  view: boolean;
  quote: boolean;
  askQuestion: boolean;
  decline: boolean;
}

export interface ArtisanJobCustomerSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ArtisanMaterialLine {
  name: string;
  amount: KoboAmount;
  supplier: MaterialSupplier;
}

export interface ArtisanOfferSummary {
  id: string;
  quoteId: string;
  authorId: string;
  version: number;
  labour: MonetaryString;
  materials: ArtisanMaterialLine[];
  base: MonetaryString;
  fee: MonetaryString;
  feeRule?: {
    mode: string;
    fixed: MonetaryString;
    basisPoints: number;
    minimum: MonetaryString;
    maximum?: MonetaryString | null;
    enabled: boolean;
  };
  warrantyMonths?: number;
  warrantyDays?: number;
  durationDays: number;
  visitStart: string;
  visitEnd: string;
  status: OfferStatus;
  expiresAt: string;
}

export interface ArtisanJobListItem {
  id: string;
  title: string;
  task?: string;
  description: string;
  status: string;
  urgency: JobUrgency;
  budgetMinimum?: MonetaryString;
  budgetMaximum?: MonetaryString;
  preferredStart?: string;
  preferredEnd?: string;
  createdAt: string;
  expiresAt?: string;
  service?: { id: string; name: string };
  trade?: { id: string; name: string };
  customer: ArtisanJobCustomerSummary;
  area?: { address?: string; state?: string; city?: string };
  distanceKm?: number;
  mediaIds?: string[];
  media?: Array<{ id: string; url: string; mimeType?: string }>;
  quoteId?: string;
  ownOffer?: ArtisanOfferSummary | null;
  declined?: boolean;
}

export interface ArtisanJobsFeedResponse {
  items: ArtisanJobListItem[];
  total: number;
  nextOffset?: number | null;
  location?: { latitude: number; longitude: number };
  radiusKm?: number;
}

export interface ArtisanJobDetail extends ArtisanJobListItem {
  answers?: Record<string, any>;
  bookingId?: string | null;
  allowedActions: ArtisanJobAllowedActions;
  restrictionReason?: string | null;
}

export interface CreateJobConversationResponse {
  quoteId: string;
  status: string;
  isNew: boolean;
}

export interface DeclineJobPayload {
  reason?: string;
}

export interface ArtisanRequestsResponse {
  items: Array<{
    id: string;
    jobId?: string;
    title: string;
    serviceName: string;
    customer: ArtisanJobCustomerSummary;
    budget?: MonetaryString;
    area?: string;
    status: string;
    createdAt: string;
  }>;
  nextCursor?: string | null;
}

// ── 4. Quotes, Counter-Offers & Withdrawals ───────────────────────
export interface CreateOfferPayload {
  labour: KoboAmount;
  materials: ArtisanMaterialLine[];
  warrantyMonths?: number;
  warrantyDays?: number;
  scope?: string;
  exclusions?: string;
  notes?: string;
  durationDays: number;
  visitStart: string;
  visitEnd: string;
}

export interface OfferPreviewPayload {
  labour: KoboAmount;
  materials: ArtisanMaterialLine[];
  durationDays: number;
  visitStart: string;
  visitEnd: string;
  warrantyMonths?: number;
  warrantyDays?: number;
  scope?: string;
  exclusions?: string;
  notes?: string;
}

export interface OfferPreviewResponse {
  labour: MonetaryString;
  materials: ArtisanMaterialLine[];
  base: MonetaryString;
  platformFee: MonetaryString;
  customerTotal: MonetaryString;
  artisanEarnings: MonetaryString;
  feePayer: "CUSTOMER";
  feeRule: any;
}

export interface ArtisanOffersListResponse {
  items: ArtisanOfferSummary[];
  nextCursor?: string | null;
}

// ── 5. Bookings, Work Updates & 48h Completion ────────────────────
export interface ArtisanBookingParticipant {
  id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ArtisanBookingDetail {
  id: string;
  quoteId: string;
  offerId: string;
  customerId: string;
  artisanId: string;
  customer?: ArtisanBookingParticipant;
  artisan?: ArtisanBookingParticipant;
  base: MonetaryString;
  fee: MonetaryString;
  status: BookingStageStatus;
  funded: boolean;
  released: boolean;
  disputed: boolean;
  visitStart: string;
  visitEnd: string;
  reservationUntil?: string | null;
  completedAt?: string | null;
  autoReleaseAt?: string | null;
  jobTitle?: string;
  jobDescription?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  materials?: ArtisanMaterialLine[];
  notes?: string;
  milestones?: Array<{
    id: string;
    title: string;
    done: boolean;
  }>;
  additions?: Array<{
    id: string;
    description: string;
    base: MonetaryString;
    fee: MonetaryString;
    status: "PROPOSED" | "ACCEPTED" | "REJECTED";
    createdAt: string;
  }>;
  workUpdatesCount?: number;
}

export interface ArtisanBookingStatusPayload {
  status: "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "WORK_SUBMITTED";
  mediaIds?: string[];
  checklist?: {
    workCompleted: boolean;
    materialsRecorded: boolean;
    customerNotified: boolean;
  };
}

export interface ArtisanBookingWorkUpdate {
  id: string;
  bookingId: string;
  authorId: string;
  clientId: string;
  text?: string;
  mediaIds?: string[];
  media?: Array<{ id: string; url: string }>;
  createdAt: string;
}

export interface CreateBookingWorkUpdatePayload {
  clientId: string; // UUIDv4
  text?: string;
  mediaIds?: string[];
}

export interface ProposeAdditionPayload {
  description: string;
  base?: KoboAmount;
  labour?: KoboAmount;
  materials?: KoboAmount;
  items?: Array<{ description: string; amount: KoboAmount }>;
}

export interface SubmitCompletionPayload {
  mediaIds: string[];
  checklist: {
    workCompleted: true;
    materialsRecorded: true;
    customerNotified: true;
  };
}

export interface SubmitCompletionResponse {
  status: "WORK_SUBMITTED";
  autoReleaseAt: string; // 48 hours server deadline
}

// ── 6. Earnings & Withdrawals ──────────────────────────────────────
export interface RequestWithdrawalPayload {
  bankId: string;
  amount: KoboAmount;
  pin: string;
}

export interface RequestWithdrawalResponse {
  id: string;
  status: "REQUESTED" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED";
  amount: MonetaryString;
  bankName: string;
  accountNumberMasked: string;
  createdAt: string;
}

// ── 7. Apprenticeships: Builder, Pipeline & Progress ──────────────
export interface CreateTrainingProgramPayload {
  tradeId: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  startsAt: string;
  durationWeeks?: number;
  durationMonths?: number;
  capacity: number;
  fee: KoboAmount; // Total fee in kobo
  outcomes?: string[];
  documentMediaIds?: string[];
}

export interface ProgramQuestionItem {
  id: string;
  prompt: string;
  type: TrainingQuestionType;
  required: boolean;
}

export interface ProgramMilestoneItem {
  id?: string;
  title: string;
  amount: KoboAmount; // sum must equal total fee
  order: number;
}

export interface PublishTrainingProgramPayload {
  schedule: string;
  sessions: Array<{
    date: string;
    title: string;
    time?: string;
  }>;
  milestones: ProgramMilestoneItem[];
}

export interface TrainingProgramDetail {
  id: string;
  artisanId: string;
  tradeId: string;
  tradeName?: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  durationWeeks: number;
  durationMonths?: number;
  capacity: number;
  enrolledCount: number;
  fee: MonetaryString;
  status: TrainingProgramStatus;
  questions: ProgramQuestionItem[];
  curriculum: Array<{ id: string; title: string; required: boolean }>;
  milestones: Array<{ id: string; title: string; amount: MonetaryString; order: number }>;
}

export interface ArtisanApplicationItem {
  id: string;
  programId: string;
  programTitle: string;
  talentId: string;
  talentName: string;
  talentAvatarUrl?: string;
  status: TrainingApplicationStatus;
  answers: Array<{
    questionId: string;
    prompt: string;
    type: TrainingQuestionType;
    answer: string;
  }>;
  priorExperience?: string;
  availability?: string;
  workMediaIds?: string[];
  workMedia?: Array<{ id: string; url: string }>;
  submittedAt: string;
}

export interface UpdateApplicationDecisionPayload {
  decision: "ACCEPTED" | "DECLINED";
  note?: string;
}

export interface ArtisanApprenticeEnrollmentItem {
  id: string;
  programId: string;
  programTitle: string;
  talentId: string;
  talentName: string;
  talentAvatarUrl?: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  learningProgressPercent: number;
  attendancePercent: number;
  payoutPercent: number;
  totalSessions: number;
  attendedSessions: number;
  milestones: Array<{
    id: string;
    title: string;
    amount: MonetaryString;
    status: "HELD_ESCROW" | "RELEASED" | "REFUNDED";
  }>;
  trainingProgress: Array<{
    id: string;
    title: string;
    required: boolean;
    done: boolean;
    completedAt?: string | null;
  }>;
  recommendation?: string | null;
}

// ── 8. Reviews, Safety & Disputes ─────────────────────────────────
export interface CreateCustomerReviewPayload {
  stars: number; // 1 to 5
  tags: CustomerReviewTag[];
  text: string;
}

export interface CreateSafetyReportPayload {
  issue: SafetyIssueType;
  bookingId?: string;
  details?: string;
  latitude?: number;
  longitude?: number;
}

export interface ArtisanDisputeItem {
  id: string;
  bookingId: string;
  jobTitle: string;
  customerName: string;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

export interface ArtisanDisputeDetail extends ArtisanDisputeItem {
  customerEvidenceMediaIds?: string[];
  safeBookingStatus: string;
  messages: Array<{
    id: string;
    authorRole: "CUSTOMER" | "ARTISAN" | "STAFF";
    text: string;
    mediaIds?: string[];
    createdAt: string;
  }>;
}

export interface RespondDisputePayload {
  text: string;
  mediaIds?: string[];
}

// ── 9. Notification Preferences ───────────────────────────────────
export interface CategoryChannelPreference {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  jobs: CategoryChannelPreference;
  bookings: CategoryChannelPreference;
  apprenticeships: CategoryChannelPreference;
  payments: CategoryChannelPreference;
  messages: CategoryChannelPreference;
  reviews: CategoryChannelPreference;
  promotions: CategoryChannelPreference;
}

export type UpdateNotificationPreferencesPayload = Partial<
  Record<keyof NotificationPreferences, Partial<CategoryChannelPreference>>
>;

// ── 10. Account, Settings & Transaction PIN ───────────────────────
export interface AccountUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  roles: string[];
  activeRole: string;
  avatarUrl?: string;
}

export interface AccountSettings {
  photoId: string | null;
  language: string;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  emailNotifications: boolean;
  smsNotifications?: boolean;
  pinConfigured: boolean;
  deletionRequestedAt?: string | null;
}

export interface AccountContacts {
  supportPhone: string;
  supportEmail: string;
  policePhone: string;
}

export interface AccountResponse {
  user: AccountUser;
  settings: AccountSettings;
  contacts: AccountContacts;
}

export interface UpdateAccountPayload {
  fullName?: string;
  photoId?: string;
  language?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

// ── 11. Own Artisan Profile ───────────────────────────────────────
export interface ArtisanOwnProfile {
  userId: string;
  businessName: string;
  bio?: string;
  yearsExperience?: number;
  latitude?: number;
  longitude?: number;
  area?: string;
  radiusKm?: number;
  approval: ArtisanApprovalStatus;
  identityStatus: string;
  identityMediaIds?: string[];
  portfolioIds?: string[];
  portfolio?: Array<{ id: string; url?: string; title?: string; description?: string }>;
  services?: ArtisanPricedServiceResponse[];
  available: boolean;
  avatarUrl?: string;
}

export interface ArtisanOwnProfileResponse {
  profile: ArtisanOwnProfile;
  services: ArtisanPricedServiceResponse[];
  competence: unknown[];
}

// ── 12. Banks & Withdrawal Beneficiaries ──────────────────────────
export interface NigerianBank {
  code: string;
  name: string;
}

export interface WithdrawalBeneficiary {
  id: string;
  accountName: string;
  last4: string;
  bankCode: string;
  createdAt?: string;
}

export interface ResolveBankPayload {
  bankCode: string;
  accountNumber: string;
}

export interface ResolvedBankAccount {
  accountName: string;
  bankCode?: string;
  accountNumber?: string;
}

export interface SaveBeneficiaryPayload {
  bankCode: string;
  accountNumber: string;
  pin: string;
  challengeId: string;
  code: string;
}

// ── 14. Referrals ─────────────────────────────────────────────────
export interface ReferralSummary {
  code: string;
  rewardAmount?: MonetaryString;
  earnedTotal?: MonetaryString;
  invitedCount?: number;
  qualifiedCount?: number;
}

export interface ReferralHistoryItem {
  id: string;
  inviteeName?: string;
  purpose?: string;
  status: string;
  reward?: MonetaryString;
  createdAt: string;
}

