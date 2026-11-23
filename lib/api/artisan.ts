/**
 * BlueFixx Artisan API Client Methods
 * Centralized API service for all Artisan operations adhering to the BlueFixx Artisan Integration Guide.
 */

import { apiClient } from "./client";
import { generateIdempotencyKey } from "@/lib/utils/idempotency";
import {
  ArtisanDashboardResponse,
  ArtisanAvailabilityPayload,
  ArtisanAvailabilityResponse,
  ArtisanTradeWithServices,
  ArtisanOnboardingResponse,
  ArtisanOnboardingPatchPayload,
  ArtisanIdentityPayload,
  ArtisanPricedServiceItem,
  ArtisanPricedServiceResponse,
  ArtisanJobFilterParams,
  ArtisanJobsFeedResponse,
  ArtisanJobDetail,
  CreateJobConversationResponse,
  DeclineJobPayload,
  ArtisanRequestsResponse,
  OfferPreviewPayload,
  OfferPreviewResponse,
  CreateOfferPayload,
  ArtisanOfferSummary,
  ArtisanOffersListResponse,
  ArtisanBookingDetail,
  ArtisanBookingStatusPayload,
  ArtisanBookingWorkUpdate,
  CreateBookingWorkUpdatePayload,
  ProposeAdditionPayload,
  SubmitCompletionPayload,
  SubmitCompletionResponse,
  ArtisanEarnings,
  RequestWithdrawalPayload,
  RequestWithdrawalResponse,
  CreateTrainingProgramPayload,
  ProgramQuestionItem,
  PublishTrainingProgramPayload,
  TrainingProgramDetail,
  ArtisanApplicationItem,
  UpdateApplicationDecisionPayload,
  ArtisanApprenticeEnrollmentItem,
  CreateCustomerReviewPayload,
  CreateSafetyReportPayload,
  ArtisanDisputeItem,
  ArtisanDisputeDetail,
  RespondDisputePayload,
  NotificationPreferences,
  UpdateNotificationPreferencesPayload,
  AccountResponse,
  UpdateAccountPayload,
  ArtisanOwnProfileResponse,
  NigerianBank,
  WithdrawalBeneficiary,
  ResolvedBankAccount,
  SaveBeneficiaryPayload,
  ReferralSummary,
  ReferralHistoryItem,
} from "@/types/artisan";

// ── 1. Dashboard & Availability ────────────────────────────────────

/**
 * Load the artisan home dashboard: profile, availability, incoming requests, active jobs, earnings & training.
 */
export async function getArtisanDashboardApi(): Promise<ArtisanDashboardResponse> {
  return apiClient.get<ArtisanDashboardResponse>("/artisan/dashboard");
}

/**
 * Toggle the artisan's availability for new incoming requests.
 */
export async function updateArtisanAvailabilityApi(
  payload: ArtisanAvailabilityPayload
): Promise<ArtisanAvailabilityResponse> {
  return apiClient.patch<ArtisanAvailabilityResponse>("/artisan/availability", payload);
}

/**
 * Get frontend capability and financial policy configuration.
 */
export async function getIntegrationConfigApi(): Promise<any> {
  return apiClient.get<any>("/integration");
}

// ── 2. Become an Artisan (Onboarding & Manual Review) ──────────────

/**
 * Fetch the active trades and service catalog for onboarding and filtering.
 */
export async function getServicesCatalogApi(): Promise<ArtisanTradeWithServices[]> {
  return apiClient.get<ArtisanTradeWithServices[]>("/services");
}

/**
 * Resume the five-step artisan onboarding wizard.
 */
export async function getArtisanOnboardingApi(): Promise<ArtisanOnboardingResponse> {
  return apiClient.get<ArtisanOnboardingResponse>("/artisan/onboarding");
}

/**
 * Save partial onboarding details without submitting review.
 */
export async function patchArtisanOnboardingApi(
  payload: ArtisanOnboardingPatchPayload
): Promise<ArtisanOnboardingResponse> {
  return apiClient.patch<ArtisanOnboardingResponse>("/artisan/onboarding", payload);
}

/**
 * Validate all onboarding steps and submit for manual staff review.
 */
export async function submitArtisanOnboardingApi(): Promise<ArtisanOnboardingResponse> {
  return apiClient.post<ArtisanOnboardingResponse>("/artisan/onboarding/submit", {});
}

/**
 * Submit encrypted NIN and manual identity evidence (gov-ID + selfie).
 */
export async function submitArtisanIdentityApi(
  payload: ArtisanIdentityPayload
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>("/artisan/identity", payload);
}

/**
 * Choose a service and save indicative price range in kobo.
 */
export async function addArtisanServiceApi(
  payload: ArtisanPricedServiceItem
): Promise<ArtisanPricedServiceResponse> {
  return apiClient.post<ArtisanPricedServiceResponse>("/artisan/services", payload);
}

// ── 3. Find Jobs, Requests, Questions & Declines ──────────────────

/**
 * Search matching jobs with trade, radius, budget, date, and urgency filters.
 */
export async function getArtisanJobsApi(
  params?: ArtisanJobFilterParams
): Promise<ArtisanJobsFeedResponse> {
  return apiClient.get<ArtisanJobsFeedResponse>("/artisan/jobs", { params });
}

/**
 * Read a job preview with safe location and quoting eligibility.
 */
export async function getArtisanJobByIdApi(id: string): Promise<ArtisanJobDetail> {
  return apiClient.get<ArtisanJobDetail>(`/artisan/jobs/${id}`);
}

/**
 * Create or resume an artisan's private quote conversation thread for a job.
 */
export async function createJobConversationApi(
  jobId: string
): Promise<CreateJobConversationResponse> {
  return apiClient.post<CreateJobConversationResponse>(
    `/artisan/jobs/${jobId}/conversation`,
    {}
  );
}

/**
 * Decline a job without closing other artisans' requests.
 */
export async function declineJobApi(
  jobId: string,
  payload?: DeclineJobPayload
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/artisan/jobs/${jobId}/decline`,
    payload || {}
  );
}

/**
 * List incoming or explicitly declined artisan requests.
 */
export async function getArtisanRequestsApi(
  tab: "incoming" | "declined" = "incoming",
  cursor?: string,
  limit = 30
): Promise<ArtisanRequestsResponse> {
  return apiClient.get<ArtisanRequestsResponse>("/artisan/requests", {
    params: { tab, cursor, limit },
  });
}

// ── 4. Quotes, Counter-Offers & Withdrawals ───────────────────────

/**
 * Preview customer fee, total, and artisan earnings before submitting an offer.
 */
export async function previewArtisanOfferApi(
  quoteId: string,
  payload: OfferPreviewPayload
): Promise<OfferPreviewResponse> {
  return apiClient.post<OfferPreviewResponse>(
    `/quotes/${quoteId}/offers/preview`,
    payload
  );
}

/**
 * Send an initial quote or structured counter-offer.
 */
export async function submitArtisanOfferApi(
  quoteId: string,
  payload: CreateOfferPayload,
  idempotencyKey?: string
): Promise<ArtisanOfferSummary> {
  return apiClient.post<ArtisanOfferSummary>(
    `/quotes/${quoteId}/offers`,
    payload,
    {
      headers: {
        "Idempotency-Key": idempotencyKey || generateIdempotencyKey(),
      },
    }
  );
}

/**
 * List submitted quotes and their outcomes.
 */
export async function getArtisanOffersApi(params?: {
  cursor?: string;
  limit?: number;
  status?: string;
}): Promise<ArtisanOffersListResponse> {
  return apiClient.get<ArtisanOffersListResponse>("/artisan/offers", { params });
}

/**
 * Read quote-sent details and allowed withdrawal action.
 */
export async function getArtisanOfferByIdApi(id: string): Promise<ArtisanOfferSummary> {
  return apiClient.get<ArtisanOfferSummary>(`/artisan/offers/${id}`);
}

/**
 * Withdraw an open quote while keeping the job available for a replacement quote.
 */
export async function withdrawArtisanOfferApi(
  offerId: string,
  idempotencyKey?: string
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/offers/${offerId}/withdraw`,
    {},
    {
      headers: {
        "Idempotency-Key": idempotencyKey || generateIdempotencyKey(),
      },
    }
  );
}

// ── 5. Bookings, Work Updates & 48h Completion ────────────────────

/**
 * List active, completed, or cancelled bookings for the artisan.
 */
export async function getArtisanBookingsApi(
  tab: "active" | "completed" | "cancelled" = "active",
  cursor?: string,
  limit = 30
): Promise<ArtisanBookingDetail[]> {
  return apiClient.get<ArtisanBookingDetail[]>("/bookings", {
    params: { view: "artisan", tab, cursor, limit },
  });
}

/**
 * Read detailed booking terms, participant info, schedule, additions, and completion deadline.
 */
export async function getArtisanBookingByIdApi(
  id: string
): Promise<ArtisanBookingDetail> {
  return apiClient.get<ArtisanBookingDetail>(`/bookings/${id}`);
}

/**
 * Advance job progress (ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> WORK_SUBMITTED).
 */
export async function updateBookingStatusApi(
  bookingId: string,
  payload: ArtisanBookingStatusPayload
): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(
    `/bookings/${bookingId}/status`,
    payload
  );
}

/**
 * Read participant-visible work updates with photos.
 */
export async function getBookingUpdatesApi(
  bookingId: string,
  cursor?: string,
  limit = 30
): Promise<{ items: ArtisanBookingWorkUpdate[]; nextCursor?: string | null }> {
  return apiClient.get<{ items: ArtisanBookingWorkUpdate[]; nextCursor?: string | null }>(
    `/bookings/${bookingId}/updates`,
    { params: { cursor, limit } }
  );
}

/**
 * Post an artisan work update with photo IDs.
 */
export async function postBookingUpdateApi(
  bookingId: string,
  payload: CreateBookingWorkUpdatePayload
): Promise<ArtisanBookingWorkUpdate> {
  return apiClient.post<ArtisanBookingWorkUpdate>(
    `/bookings/${bookingId}/updates`,
    payload
  );
}

/**
 * Propose additional work with labour/materials amounts.
 */
export async function proposeBookingAdditionApi(
  bookingId: string,
  payload: ProposeAdditionPayload
): Promise<any> {
  return apiClient.post<any>(`/bookings/${bookingId}/additions`, payload);
}

/**
 * Submit completion photos and the 3-point checklist to start the 48-hour customer confirmation window.
 */
export async function submitBookingCompletionApi(
  bookingId: string,
  payload: SubmitCompletionPayload
): Promise<SubmitCompletionResponse> {
  return apiClient.post<SubmitCompletionResponse>(
    `/bookings/${bookingId}/completion`,
    payload
  );
}

/**
 * Update private job notes.
 */
export async function updateBookingNotesApi(
  bookingId: string,
  notes: string
): Promise<{ notes: string }> {
  return apiClient.patch<{ notes: string }>(`/bookings/${bookingId}/notes`, { notes });
}

// ── 6. Earnings & Withdrawals ──────────────────────────────────────

/**
 * Get available/reserved balance, escrow, monthly/lifetime earnings, and weekly Nigerian chart.
 */
export async function getArtisanEarningsApi(): Promise<ArtisanEarnings> {
  return apiClient.get<ArtisanEarnings>("/artisan/earnings");
}

/**
 * Get full earnings activity ledger.
 */
export async function getArtisanEarningsActivityApi(
  cursor?: string,
  limit = 30
): Promise<{ items: any[]; nextCursor?: string | null }> {
  return apiClient.get<{ items: any[]; nextCursor?: string | null }>(
    "/artisan/earnings/activity",
    { params: { cursor, limit } }
  );
}

/**
 * Submit a wallet withdrawal request using verified beneficiary bank and transaction PIN.
 */
export async function requestArtisanWithdrawalApi(
  payload: RequestWithdrawalPayload,
  idempotencyKey?: string
): Promise<RequestWithdrawalResponse> {
  return apiClient.post<RequestWithdrawalResponse>(
    "/wallet/withdrawals",
    payload,
    {
      headers: {
        "Idempotency-Key": idempotencyKey || generateIdempotencyKey(),
      },
    }
  );
}

// ── 7. Apprenticeships: Builder, Pipeline & Progress ──────────────

/**
 * Create a new draft apprenticeship programme.
 */
export async function createTrainingProgramApi(
  payload: CreateTrainingProgramPayload
): Promise<TrainingProgramDetail> {
  return apiClient.post<TrainingProgramDetail>(
    "/artisan/training/programs",
    payload
  );
}

/**
 * Save custom questionnaire for a draft programme.
 */
export async function patchProgramQuestionsApi(
  programId: string,
  questions: ProgramQuestionItem[]
): Promise<{ questions: ProgramQuestionItem[] }> {
  return apiClient.patch<{ questions: ProgramQuestionItem[] }>(
    `/artisan/training/programs/${programId}/questions`,
    { questions }
  );
}

/**
 * Publish training programme with schedule, sessions, and milestones summing to total fee.
 */
export async function publishTrainingProgramApi(
  programId: string,
  payload: PublishTrainingProgramPayload
): Promise<TrainingProgramDetail> {
  return apiClient.post<TrainingProgramDetail>(
    `/artisan/training/programs/${programId}/publish`,
    payload
  );
}

/**
 * List all training programmes created by this artisan.
 */
export async function getArtisanTrainingProgramsApi(): Promise<TrainingProgramDetail[]> {
  return apiClient.get<TrainingProgramDetail[]>("/artisan/training/programs");
}

/**
 * Update an owned training programme.
 */
export async function updateTrainingProgramApi(
  programId: string,
  payload: {
    title?: string;
    description?: string;
    location?: string;
    capacity?: number;
    fee?: number;
    durationWeeks?: number;
    durationMonths?: number;
    outcomes?: string[];
    status?: "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";
  }
): Promise<TrainingProgramDetail> {
  return apiClient.patch<TrainingProgramDetail>(
    `/artisan/training/programs/${programId}`,
    payload
  );
}

/**
 * List training applications filtered by programme and status (SUBMITTED, UNDER_REVIEW, ACCEPTED, DECLINED).
 */
export async function getArtisanApplicationsApi(params?: {
  programId?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ items: ArtisanApplicationItem[]; nextCursor?: string | null }> {
  return apiClient.get<{ items: ArtisanApplicationItem[]; nextCursor?: string | null }>(
    "/artisan/training/applications",
    { params }
  );
}

export interface ArtisanApplicationDetail {
  id: string;
  programId: string;
  talentId: string;
  motivation: string;
  experience: string;
  sixDayAvailability: boolean;
  currentSituation: string;
  workMediaIds: string[];
  answers?: Record<string, string | boolean | string[]>;
  status: string;
  createdAt: string;
  program?: {
    id: string;
    title: string;
    location: string;
    durationWeeks?: number;
    durationMonths?: number;
    fee?: string | number;
    questions?: ProgramQuestionItem[];
  };
  talent?: {
    id: string;
    fullName: string;
    CustomerProfile_userId?: { photoId?: string | null } | null;
  };
}

/**
 * Fetch full details, answers, and portfolio references for one application.
 */
export async function getArtisanApplicationDetailApi(
  applicationId: string
): Promise<ArtisanApplicationDetail> {
  return apiClient.get<ArtisanApplicationDetail>(
    `/artisan/training/applications/${applicationId}`
  );
}

/**
 * Accept or decline an apprenticeship application.
 */
export async function updateApplicationDecisionApi(
  applicationId: string,
  payload: UpdateApplicationDecisionPayload
): Promise<{ status: string }> {
  return apiClient.patch<{ status: string }>(
    `/artisan/training/applications/${applicationId}`,
    payload
  );
}

/**
 * List active and completed apprentice enrollments for this artisan.
 */
export async function getArtisanEnrollmentsApi(): Promise<
  ArtisanApprenticeEnrollmentItem[]
> {
  return apiClient.get<ArtisanApprenticeEnrollmentItem[]>(
    "/artisan/training/enrollments"
  );
}

/**
 * Sign off on a required apprentice curriculum step.
 */
export async function updateApprenticeProgressApi(
  enrollmentId: string,
  stepId: string,
  done: boolean
): Promise<{ learningProgressPercent: number; attendancePercent: number; payoutPercent: number }> {
  return apiClient.patch<{ learningProgressPercent: number; attendancePercent: number; payoutPercent: number }>(
    `/artisan/training/enrollments/${enrollmentId}/progress/${stepId}`,
    { done }
  );
}

/**
 * Submit or update a mentor recommendation for an apprentice.
 */
export async function submitApprenticeRecommendationApi(
  enrollmentId: string,
  text: string
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/artisan/training/enrollments/${enrollmentId}/recommendation`,
    { text }
  );
}

/**
 * Request completion of apprenticeship once all milestones & signoffs are finished.
 */
export async function completeApprenticeTrainingApi(
  enrollmentId: string
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/artisan/training/enrollments/${enrollmentId}/completion`,
    {}
  );
}

// ── 8. Feedback, Safety, Disputes & Notifications ─────────────────

/**
 * Rate a customer for a completed booking within the 30-day window.
 */
export async function submitCustomerReviewApi(
  bookingId: string,
  payload: CreateCustomerReviewPayload
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/artisan/bookings/${bookingId}/customer-review`,
    payload
  );
}

/**
 * List completed jobs eligible for a customer review.
 */
export async function getCustomerReviewsEligibleApi(): Promise<any[]> {
  return apiClient.get<any[]>("/artisan/customer-reviews");
}

/**
 * Submit an urgent safety report.
 */
export async function submitSafetyReportApi(
  payload: CreateSafetyReportPayload
): Promise<{ message: string; reportId?: string }> {
  return apiClient.post<{ message: string; reportId?: string }>(
    "/artisan/safety/reports",
    payload
  );
}

/**
 * List booking dispute complaints relevant to the artisan.
 */
export async function getArtisanDisputesApi(): Promise<ArtisanDisputeItem[]> {
  return apiClient.get<ArtisanDisputeItem[]>("/artisan/disputes");
}

/**
 * Get dispute detail with customer report and shared mutual messages.
 */
export async function getArtisanDisputeDetailApi(
  id: string
): Promise<ArtisanDisputeDetail> {
  return apiClient.get<ArtisanDisputeDetail>(`/artisan/disputes/${id}`);
}

/**
 * Respond to a dispute case with text and evidence media IDs.
 */
export async function respondToDisputeApi(
  id: string,
  payload: RespondDisputePayload
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    `/artisan/disputes/${id}/respond`,
    payload
  );
}

/**
 * Get channel notification preferences.
 */
export async function getArtisanNotificationPreferencesApi(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>("/account/notification-preferences");
}

/**
 * Update partial channel notification preferences.
 */
export async function updateArtisanNotificationPreferencesApi(
  payload: UpdateNotificationPreferencesPayload
): Promise<NotificationPreferences> {
  return apiClient.patch<NotificationPreferences>(
    "/account/notification-preferences",
    payload
  );
}

/**
 * Get referral invite code, rewards, and total earnings.
 */
export async function getArtisanReferralsSummaryApi(): Promise<ReferralSummary> {
  return apiClient.get<ReferralSummary>("/account/referrals");
}

/**
 * Get private referral progress and reward history.
 */
export async function getArtisanReferralsHistoryApi(
  cursor?: string,
  limit = 30
): Promise<{ items: ReferralHistoryItem[]; nextCursor?: string | null }> {
  return apiClient.get<{ items: ReferralHistoryItem[]; nextCursor?: string | null }>(
    "/account/referrals/history",
    { params: { cursor, limit } }
  );
}

/**
 * Load the authenticated account: user, settings, and support contacts.
 */
export async function getAccountApi(): Promise<AccountResponse> {
  return apiClient.get<AccountResponse>("/account");
}

/**
 * Update personal details, language, emergency contact or notification preferences.
 */
export async function updateAccountApi(
  payload: UpdateAccountPayload
): Promise<AccountResponse> {
  return apiClient.patch<AccountResponse>("/account", payload);
}

// ── 10. Profile (own & public) ────────────────────────────────────

/**
 * Read the authenticated artisan's onboarding progress and services.
 */
export async function getArtisanOwnProfileApi(): Promise<ArtisanOwnProfileResponse> {
  return apiClient.get<ArtisanOwnProfileResponse>("/artisan/profile");
}

/**
 * Reply to a customer review.
 */
export async function replyToArtisanReviewApi(
  reviewId: string,
  reply: string
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/reviews/${reviewId}/reply`, { reply });
}

// ── 11. Banks & Withdrawal Beneficiaries ──────────────────────────

/**
 * Supported Nigerian banks for beneficiary selection.
 */
export async function getNigerianBanksApi(): Promise<NigerianBank[]> {
  return apiClient.get<NigerianBank[]>("/banks");
}

/**
 * List masked withdrawal and payout beneficiaries.
 */
export async function getWithdrawalBeneficiariesApi(): Promise<WithdrawalBeneficiary[]> {
  return apiClient.get<WithdrawalBeneficiary[]>("/account/banks");
}

/**
 * Save a bank beneficiary (resolve + verify via PIN & BANK challenge).
 */
export async function saveBankBeneficiaryApi(
  payload: SaveBeneficiaryPayload
): Promise<WithdrawalBeneficiary> {
  return apiClient.post<WithdrawalBeneficiary>("/account/banks", payload);
}

/**
 * Select a default verified withdrawal account.
 */
export async function setDefaultBeneficiaryApi(
  id: string,
  pin: string
): Promise<{ message: string }> {
  return apiClient.patch<{ message: string }>(`/account/banks/${id}/default`, { pin });
}

// ── 12. Competence, Assessments & Extended Training ───────────────

export async function getCustomerReviewForBookingApi(bookingId: string): Promise<unknown> {
  return apiClient.get(`/artisan/bookings/${bookingId}/customer-review`);
}

export async function getArtisanCompetenceApi(): Promise<unknown> {
  return apiClient.get("/artisan/competence");
}

export async function getArtisanAssessmentsApi(): Promise<unknown[]> {
  return apiClient.get<unknown[]>("/artisan/assessments");
}

export async function startArtisanAssessmentApi(payload: { tradeId: string }): Promise<unknown> {
  return apiClient.post("/artisan/assessments", payload);
}

export async function getArtisanAssessmentByIdApi(id: string): Promise<unknown> {
  return apiClient.get(`/artisan/assessments/${id}`);
}

export async function submitAssessmentAnswersApi(
  id: string,
  payload: { answers: Array<{ questionId: string; answer: string }> }
): Promise<unknown> {
  return apiClient.post(`/artisan/assessments/${id}/answers`, payload);
}

export async function submitAssessmentEvidenceApi(
  id: string,
  payload: { mediaIds: string[]; notes?: string }
): Promise<unknown> {
  return apiClient.post(`/artisan/assessments/${id}/evidence`, payload);
}

export async function getArtisanApplicationByIdApi(id: string): Promise<unknown> {
  return apiClient.get(`/artisan/training/applications/${id}`);
}

export async function updateTrainingCurriculumApi(
  programId: string,
  payload: { curriculum: unknown }
): Promise<unknown> {
  return apiClient.patch(`/artisan/training/programs/${programId}/curriculum`, payload);
}

export async function getArtisanEnrollmentCertificateApi(enrollmentId: string): Promise<unknown> {
  return apiClient.get(`/artisan/training/enrollments/${enrollmentId}/certificate`);
}

export async function createTrainingAssignmentApi(
  enrollmentId: string,
  payload: { title: string; description?: string; dueAt?: string }
): Promise<unknown> {
  return apiClient.post(`/artisan/training/enrollments/${enrollmentId}/assignments`, payload);
}

export async function reviewTrainingAssignmentApi(
  assignmentId: string,
  payload: { approved: boolean; feedback?: string }
): Promise<unknown> {
  return apiClient.post(`/artisan/training/assignments/${assignmentId}/review`, payload);
}

export async function recordTrainingAttendanceApi(
  enrollmentId: string,
  payload: { date: string; present: boolean; notes?: string }
): Promise<unknown> {
  return apiClient.post(`/artisan/training/enrollments/${enrollmentId}/attendance`, payload);
}

export async function submitTrainingMilestoneApi(milestoneId: string): Promise<unknown> {
  return apiClient.post(`/artisan/training/milestones/${milestoneId}/submit`, {});
}

