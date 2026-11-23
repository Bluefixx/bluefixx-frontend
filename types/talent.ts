/**
 * BlueFixx Talent & Apprenticeship Types
 * Based on the BlueFixx Talent API specification
 */

// ── Role ────────────────────────────────────────────────────────
export type TalentRole = "TALENT";

// ── Common Trade & Artisan Profile ──────────────────────────────
export interface TalentTrade {
  id: string;
  name: string;
}

export interface TalentArtisanProfile {
  approval?: string;
  ratingTotal?: number;
  ratingCount?: number;
  yearsExperience?: number;
}

export interface TalentArtisan {
  id: string;
  fullName: string;
  avatarUrl?: string;
  ArtisanProfile_userId?: TalentArtisanProfile;
}

// ── Programme Discovery ─────────────────────────────────────────
export interface TalentProgramListItem {
  id: string;
  title: string;
  trade: TalentTrade;
  artisan: TalentArtisan;
  location: string;
  startsAt: string;
  durationWeeks: number;
  fee: string; // decimal string in kobo (e.g. "15000000")
  capacity: number;
  placesLeft: number;
  distanceKm?: number;
}

export interface TalentProgramFilterParams {
  cursor?: string;
  limit?: number;
  tradeId?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface TalentProgramSession {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface TalentProgramReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface TalentProgramDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  durationWeeks: number;
  fee: string;
  outcomes: string[];
  placesLeft: number;
  trade?: TalentTrade;
  artisan?: TalentArtisan;
  sessions?: TalentProgramSession[];
  reviews?: TalentProgramReview[];
}

// ── Home Summary ────────────────────────────────────────────────
export interface TalentUpcomingSession {
  id: string;
  programTitle: string;
  masterArtisanName: string;
  date: string;
  time: string;
  location: string;
}

export interface TalentHomeSummary {
  enrollments: TalentEnrollmentSummary[];
  upcomingSessions: TalentUpcomingSession[];
}

// ── Applications ────────────────────────────────────────────────
export type TalentCurrentSituation =
  | "SECONDARY_SCHOOL"
  | "UNEMPLOYED"
  | "CHANGING_TRADE"
  | "STUDENT"
  | "OTHER";

export type TalentApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "DECLINED"
  | "WITHDRAWN"
  | "EXPIRED";

export interface CreateTalentApplicationPayload {
  motivation: string;
  experience: string;
  sixDayAvailability: boolean;
  currentSituation: TalentCurrentSituation;
  workMediaIds?: string[];
  answers?: Record<string, unknown>;
}

export interface CreateTalentApplicationResponse {
  id: string;
  programId: string;
  status: TalentApplicationStatus;
  createdAt: string;
}

export interface TalentApplicationListItem {
  id: string;
  status: TalentApplicationStatus;
  program: {
    id: string;
    title: string;
    trade?: TalentTrade;
    artisan?: TalentArtisan;
    location?: string;
    durationWeeks?: number;
    fee?: string;
  };
  enrollment: TalentEnrollmentSummary | null;
  createdAt?: string;
  decisionReason?: string;
}

// ── Program Availability Alerts ─────────────────────────────────
export interface TalentAlert {
  id: string;
  tradeId?: string;
  search?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  active: boolean;
}

export interface CreateTalentAlertPayload {
  tradeId?: string;
  search?: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

// ── Training Enrollment & Progress ──────────────────────────────
export type TalentEnrollmentStatus =
  | "RESERVED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface TalentMilestone {
  id: string;
  title: string;
  description?: string;
  amount: string;
  status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "RELEASED";
  releasedAt?: string | null;
  stageNumber?: number;
}

export interface TalentAttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  notes?: string;
}

export interface TalentAssignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "PENDING" | "SUBMITTED" | "REVIEWED" | "APPROVED";
  submission?: string;
  submittedAt?: string;
  mediaIds?: string[];
}

export interface TalentEnrollmentSummary {
  id: string;
  status: TalentEnrollmentStatus;
  programTitle: string;
  fee: string;
  progressPercent: number;
  attendancePercent: number;
  reservationExpiresAt?: string;
  masterArtisanName?: string;
  artisanId?: string;
}

export interface TalentEnrollmentDetail extends TalentEnrollmentSummary {
  milestones: TalentMilestone[];
  attendance: TalentAttendanceRecord[];
  assignments: TalentAssignment[];
  payments: Array<{
    id: string;
    amount: string;
    status: string;
    createdAt: string;
  }>;
  refunds: Array<{
    id: string;
    status: string;
    requestedAmount: string;
    destination: string;
  }>;
  program?: TalentProgramDetail;
}

// ── Payment ─────────────────────────────────────────────────────
export type TalentPaymentSource = "WALLET" | "PAYSTACK";

export interface PayTalentEnrollmentPayload {
  source: TalentPaymentSource;
  pin?: string;
}

export interface PayTalentEnrollmentResponse {
  id: string;
  purpose: string;
  source: TalentPaymentSource;
  amount: string;
  base: string;
  fee: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  trainingEnrollmentId: string;
  reference: string;
  checkoutUrl?: string;
}

// ── Assignment Submission ───────────────────────────────────────
export interface SubmitAssignmentPayload {
  submission: string;
  mediaIds?: string[];
}

export interface SubmitAssignmentResponse {
  id: string;
  status: "SUBMITTED";
  submittedAt: string;
}

// ── Milestone Confirmation ──────────────────────────────────────
export interface ConfirmMilestoneResponse {
  id: string;
  status: "RELEASED";
  releasedAt: string;
}

// ── Completion & Certificates ───────────────────────────────────
export interface ConfirmTalentCompletionResponse {
  id: string;
  status: "COMPLETED";
  certificateCode: string;
}

export interface TalentCertificateRecord {
  certificateCode: string;
  programTitle: string;
  completedAt: string;
  artisanId: string;
}

// ── Reviews ─────────────────────────────────────────────────────
export interface SubmitArtisanReviewPayload {
  rating: number; // 1 to 5
  tags?: string[];
  text?: string;
}

export interface SubmitArtisanReviewResponse {
  id: string;
  enrollmentId: string;
  rating: number;
  tags?: string[];
  text?: string;
  createdAt: string;
}

// ── Messages ────────────────────────────────────────────────────
export interface TalentMessage {
  id: string;
  programId: string;
  senderId: string;
  text?: string;
  mediaIds?: string[];
  createdAt: string;
}

export interface SendTalentMessagePayload {
  clientId: string;
  text?: string;
  mediaIds?: string[];
  talentId?: string;
}

export interface TalentConversationParticipant {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface TalentConversation {
  id?: string;
  programId: string;
  programTitle?: string;
  talentId?: string;
  participant?: TalentConversationParticipant;
  peer?: {
    id: string;
    fullName: string;
    photoId?: string | null;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  latestMessage?: {
    text?: string;
    createdAt?: string;
  } | null;
  unreadCount?: number;
  unread?: number;
}

// ── Refunds ─────────────────────────────────────────────────────
export type TalentRefundReason =
  | "UNSAFE"
  | "TRAINING_NOT_AS_DESCRIBED"
  | "SESSIONS_CANCELLED"
  | "CHANGED_MIND"
  | "OTHER";

export type TalentRefundDestination = "WALLET" | "BANK";

export interface RequestTalentRefundPayload {
  reason: TalentRefundReason;
  details: string;
  destination?: TalentRefundDestination;
  bankId?: string;
}

export interface RequestTalentRefundResponse {
  id: string;
  status: "PENDING";
  requestedAmount: string;
  destination: TalentRefundDestination;
}

