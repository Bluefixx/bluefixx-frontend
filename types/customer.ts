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
