/**
 * BlueFixx Customer & Marketplace Types
 * Based on the BlueFixx Customer API specification
 */

// ── Dashboard ────────────────────────────────────────────────
export interface CustomerDashboardResponse {
  activeJobs: unknown[];
  recentJobs: unknown[];
  unreadNotifications: number;
  popularServices: {
    serviceId: string;
    count: number;
    name?: string;
  }[];
}

// ── Catalog & Services ───────────────────────────────────────
export interface ServiceItem {
  id: string;
  tradeId: string;
  name: string;
  active: boolean;
  startingPrice?: string;
}

export interface TradeCategory {
  id: string;
  name: string;
  active: boolean;
  services: ServiceItem[];
}

export interface CatalogGroup {
  id: string;
  categoryName: string;
  description?: string;
  startingPriceKobo?: number;
  trades?: TradeCategory[];
}

// ── Artisans Discovery ───────────────────────────────────────
export interface ArtisanListItem {
  userId: string;
  businessName: string;
  fullName: string;
  photoId: string | null;
  photoUrl?: string;
  area: string;
  available: boolean;
  completedJobs: number;
  ratingCount: number;
  rating: number;
  level: number; // 1: Verified, 2: Certified, 3: Expert, 4: Master
  distance: number; // in metres
}

export interface ArtisanQueryParams {
  latitude: number;
  longitude: number;
  distance?: number; // max radius in km (default: 15)
  tradeId?: string;
  minimumLevel?: number;
  available?: boolean;
  sort?: "recommended" | "nearest" | "rating";
  limit?: number;
  offset?: number;
}

export interface ArtisanDetailResponse {
  userId: string;
  businessName: string;
  fullName: string;
  bio?: string;
  photoId: string | null;
  photoUrl?: string;
  area: string;
  level: number;
  rating: number;
  ratingCount: number;
  completedJobs: number;
  services: {
    serviceId: string;
    name: string;
    indicativePrice?: string;
  }[];
  portfolio: {
    id: string;
    title: string;
    mediaId: string;
    mediaUrl?: string;
  }[];
  reviews: {
    id: string;
    customerName: string;
    stars: number;
    comment: string;
    createdAt: string;
  }[];
}

// ── Quotes & Offers ──────────────────────────────────────────
export type UrgencyLevel = "EMERGENCY" | "WITHIN_TWO_DAYS" | "THIS_WEEK" | "FLEXIBLE";

export interface QuoteMaterialItem {
  name: string;
  amount: number; // in kobo
  supplier: "ARTISAN" | "CUSTOMER";
}

export interface CreateQuoteRequest {
  artisanId: string;
  serviceId: string;
  description: string;
  urgency: UrgencyLevel;
  addressId: string;
  preferredStart: string; // ISO date-time
  preferredEnd: string; // ISO date-time
  mediaIds: string[];
  submit?: boolean;
}

export interface QuoteOffer {
  id: string;
  quoteId: string;
  authorId: string;
  version: number;
  labour: string | number; // in kobo
  materials: QuoteMaterialItem[];
  base: string; // in kobo
  fee: string;
  feeRule?: {
    mode: string;
    fixed: string;
    basisPoints: number;
    minimum: string;
    maximum: string | null;
    enabled: boolean;
  };
  warrantyMonths: number;
  warrantyDays?: number;
  durationDays: number;
  visitStart: string;
  visitEnd: string;
  status: "OPEN" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  expiresAt: string;
}

export interface QuoteResponse {
  id: string;
  customerId: string;
  artisanId: string;
  serviceId: string;
  description: string;
  urgency: string;
  address: Record<string, unknown>;
  preferredStart: string;
  preferredEnd: string;
  mediaIds: string[];
  status: "DRAFT" | "OPEN" | "ACKNOWLEDGED" | "CLOSED" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
  offers: QuoteOffer[];
}

// ── Jobs ─────────────────────────────────────────────────────
export interface CreateJobRequest {
  serviceId: string;
  title: string;
  task?: string;
  description: string;
  urgency: UrgencyLevel;
  addressId: string;
  preferredStart: string;
  preferredEnd: string;
  mediaIds?: string[];
  budgetMinimum?: number;
  budgetMaximum?: number;
  answers?: Record<string, unknown>;
  submit?: boolean;
}

export interface JobPost {
  id: string;
  customerId: string;
  serviceId: string;
  title: string;
  description: string;
  urgency: string;
  status: "DRAFT" | "OPEN" | "BOOKED" | "EXPIRED" | "CANCELLED";
  preferredStart: string;
  preferredEnd: string;
  quotesCount?: number;
  createdAt: string;
}

// ── Bookings ─────────────────────────────────────────────────
export interface Booking {
  id: string;
  quoteId: string;
  offerId: string;
  customerId: string;
  artisanId: string;
  base: string;
  fee: string;
  status: "AWAITING_PAYMENT" | "FUNDED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  funded: boolean;
  released: boolean;
  disputed: boolean;
  visitStart: string;
  visitEnd: string;
  reservationUntil?: string;
  completedAt: string | null;
}

export interface BookingDetail extends Booking {
  quote?: QuoteResponse;
  offer?: QuoteOffer;
  artisan?: {
    id: string;
    fullName: string;
    phone?: string;
    photoUrl?: string;
    businessName?: string;
  };
  customer?: {
    id: string;
    fullName: string;
    phone?: string;
  };
  timeline?: {
    event: string;
    timestamp: string;
    actor?: string;
  }[];
}

// ── Wallet ───────────────────────────────────────────────────
export interface WalletSummary {
  currency: string;
  available: string; // in kobo string
  withdrawalReserved: string;
  bookingHeld: string;
}

export interface WalletTransaction {
  id: string;
  type: "PAYMENT" | "DEPOSIT" | "REFUND" | "WITHDRAWAL";
  amount: string;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference: string;
  description: string;
  createdAt: string;
}

// ── Messages & Conversations ─────────────────────────────────
export interface ChatMessage {
  id: string;
  quoteId: string;
  senderId: string;
  text: string;
  mediaIds: string[];
  clientId?: string;
  createdAt: string;
}

export interface Conversation {
  quoteId: string;
  peer: {
    id: string;
    fullName: string;
    photoUrl?: string;
  };
  latestMessage: ChatMessage;
  unread: number;
  status: string;
}

// ── Reviews ──────────────────────────────────────────────────
export interface Review {
  id: string;
  bookingId: string;
  artisanId: string;
  stars: number;
  text: string;
  wouldRecommend?: boolean;
  tags?: string[];
  mediaIds?: string[];
  createdAt: string;
}

export interface CreateReviewRequest {
  stars: number;
  text: string;
  wouldRecommend?: boolean;
  tags?: string[];
  mediaIds?: string[];
}

// ── Notifications ────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  resourceId?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  jobUpdates: boolean;
  marketing: boolean;
}

// ── Addresses & Locations ────────────────────────────────────
export interface SavedAddress {
  id: string;
  userId: string;
  title: string; // e.g. "Home", "Office"
  street: string;
  city: string;
  state: string;
  area: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  title: string;
  street: string;
  city: string;
  state: string;
  area?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface GeocodedLocation {
  id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

// ── Account Profile & Sessions ────────────────────────────────
export interface AccountProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  language?: string;
  ninVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountRequest {
  fullName?: string;
  photoId?: string;
  avatarId?: string;
  email?: string;
  bio?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  language?: string;
}

export interface UserSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserRoleInfo {
  role: "CUSTOMER" | "ARTISAN" | "LEARNER";
  enrolledAt: string;
  isActive: boolean;
}

// ── Media & Uploads ──────────────────────────────────────────
/**
 * Upload purposes accepted by `POST /media`. Audio-only media (VOICE) and video
 * evidence (EVIDENCE, ASSESSMENT) are stored as `video` resources.
 */
export type MediaPurpose =
  | "PROFILE"
  | "PORTFOLIO"
  | "IDENTITY"
  | "JOB"
  | "CHAT"
  | "VOICE"
  | "COMPLETION"
  | "EVIDENCE"
  | "REVIEW"
  | "ASSESSMENT";

export type MediaResourceType = "image" | "video";

export interface MediaUploadInitiateRequest {
  purpose: MediaPurpose;
  resourceType: MediaResourceType;
}

export interface MediaUploadInitiateResponse {
  id: string;
  uploadUrl: string;
  /** Signed provider fields to submit with the binary as multipart/form-data. */
  fields: Record<string, string | number | boolean>;
  maximumBytes?: number;
}

export interface MediaUrlResponse {
  id?: string;
  url: string;
  expiresIn?: number;
}

// ── Banks & Financial Accounts ───────────────────────────────
export interface SupportedBank {
  name: string;
  code: string;
  slug: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateBankAccountRequest {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// ── Referrals ("Invite and Earn") ────────────────────────────
export interface ReferralSummary {
  code?: string;
  referralCode?: string;
  inviteUrl?: string | null;
  referralLink?: string;
  policy?: {
    enabled: boolean;
    inviterReward: string;
    inviteeReward: string;
    expiryDays: number;
  };
  totals?: {
    invited: number;
    qualified: number;
    earned: string;
  };
  totalInvited?: number;
  totalEarnedKobo?: number;
  pendingRewardKobo?: number;
  history?: {
    id: string;
    refereeName?: string;
    status: string;
    rewardKobo?: number;
    createdAt: string;
  }[];
}

// ── Support Cases & Help ─────────────────────────────────────
export type SupportCategory = "DISPUTE" | "WARRANTY" | "SAFETY" | "GENERAL" | "BILLING";

export interface SupportCase {
  id: string;
  category: SupportCategory;
  subject: string;
  description: string;
  bookingId?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  mediaIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportCaseRequest {
  category: SupportCategory;
  subject: string;
  description: string;
  bookingId?: string;
  mediaIds?: string[];
}

export interface SupportCaseMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderRole: "USER" | "SUPPORT";
  text: string;
  mediaIds?: string[];
  createdAt: string;
}

export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content: string;
}
