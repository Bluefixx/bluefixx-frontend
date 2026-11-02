import { apiClient } from "./client";
import {
  TalentHomeSummary,
  TalentProgramListItem,
  TalentProgramFilterParams,
  TalentProgramDetail,
  CreateTalentApplicationPayload,
  CreateTalentApplicationResponse,
  TalentApplicationListItem,
  TalentAlert,
  CreateTalentAlertPayload,
  TalentEnrollmentDetail,
  PayTalentEnrollmentPayload,
  PayTalentEnrollmentResponse,
  SubmitAssignmentPayload,
  SubmitAssignmentResponse,
  ConfirmMilestoneResponse,
  ConfirmTalentCompletionResponse,
  TalentCertificateRecord,
  SubmitArtisanReviewPayload,
  SubmitArtisanReviewResponse,
  TalentMessage,
  SendTalentMessagePayload,
  RequestTalentRefundPayload,
  RequestTalentRefundResponse,
} from "@/types/talent";

/**
 * Fetch talent home dashboard with active training and upcoming sessions
 */
export async function getTalentHomeApi(): Promise<TalentHomeSummary> {
  return apiClient.get<TalentHomeSummary>("/talent/home");
}

/**
 * Discover open apprenticeship programmes by trade, location, and search
 */
export async function getTalentProgramsApi(
  params?: TalentProgramFilterParams
): Promise<TalentProgramListItem[]> {
  return apiClient.get<TalentProgramListItem[]>("/talent/programs", {
    params,
  });
}

/**
 * Get detailed programme terms, artisan profile, portfolio, reviews, and available places
 */
export async function getTalentProgramByIdApi(
  id: string
): Promise<TalentProgramDetail> {
  return apiClient.get<TalentProgramDetail>(`/talent/programs/${id}`);
}

/**
 * Submit an application to an apprenticeship programme
 */
export async function submitTalentApplicationApi(
  programId: string,
  payload: CreateTalentApplicationPayload
): Promise<CreateTalentApplicationResponse> {
  return apiClient.post<CreateTalentApplicationResponse, CreateTalentApplicationPayload>(
    `/talent/programs/${programId}/applications`,
    payload
  );
}

/**
 * List the Talent's apprenticeship applications and decisions
 */
export async function getTalentApplicationsApi(): Promise<TalentApplicationListItem[]> {
  return apiClient.get<TalentApplicationListItem[]>("/talent/applications");
}

/**
 * Withdraw an application awaiting artisan review
 */
export async function withdrawTalentApplicationApi(
  id: string
): Promise<{ id: string; status: string }> {
  return apiClient.post<{ id: string; status: string }>(
    `/talent/applications/${id}/withdraw`,
    {}
  );
}

/**
 * List saved programme availability alerts
 */
export async function getTalentAlertsApi(): Promise<TalentAlert[]> {
  return apiClient.get<TalentAlert[]>("/talent/alerts");
}

/**
 * Create a new programme availability alert
 */
export async function createTalentAlertApi(
  payload: CreateTalentAlertPayload
): Promise<TalentAlert> {
  return apiClient.post<TalentAlert, CreateTalentAlertPayload>(
    "/talent/alerts",
    payload
  );
}

/**
 * Remove a saved programme alert
 */
export async function deleteTalentAlertApi(
  id: string
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/talent/alerts/${id}`);
}

/**
 * Pay the full agreed programme fee from wallet or Paystack
 */
export async function payTalentEnrollmentApi(
  enrollmentId: string,
  payload: PayTalentEnrollmentPayload,
  idempotencyKey?: string
): Promise<PayTalentEnrollmentResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  return apiClient.post<PayTalentEnrollmentResponse, PayTalentEnrollmentPayload>(
    `/talent/enrollments/${enrollmentId}/pay`,
    payload,
    { headers }
  );
}

/**
 * Fetch training agreement, payment, progress, sessions, attendance, and assignments
 */
export async function getTalentEnrollmentByIdApi(
  id: string
): Promise<TalentEnrollmentDetail> {
  return apiClient.get<TalentEnrollmentDetail>(`/talent/enrollments/${id}`);
}

/**
 * Submit assignment text and work sample media
 */
export async function submitAssignmentApi(
  assignmentId: string,
  payload: SubmitAssignmentPayload
): Promise<SubmitAssignmentResponse> {
  return apiClient.post<SubmitAssignmentResponse, SubmitAssignmentPayload>(
    `/talent/training/assignments/${assignmentId}/submission`,
    payload
  );
}

/**
 * Confirm milestone and release its escrow amount after 30 days
 */
export async function confirmMilestoneApi(
  milestoneId: string
): Promise<ConfirmMilestoneResponse> {
  return apiClient.post<ConfirmMilestoneResponse>(
    `/talent/training/milestones/${milestoneId}/confirm`,
    {}
  );
}

/**
 * Confirm apprenticeship completion and trigger certificate issuance
 */
export async function confirmTalentCompletionApi(
  enrollmentId: string
): Promise<ConfirmTalentCompletionResponse> {
  return apiClient.post<ConfirmTalentCompletionResponse>(
    `/talent/enrollments/${enrollmentId}/completion/confirm`,
    {}
  );
}

/**
 * Get a completed apprenticeship certificate record
 */
export async function getTalentCertificateApi(
  id: string
): Promise<TalentCertificateRecord> {
  return apiClient.get<TalentCertificateRecord>(`/talent/certificates/${id}`);
}

/**
 * Submit or edit the artisan review after training completion
 */
export async function submitArtisanReviewApi(
  enrollmentId: string,
  payload: SubmitArtisanReviewPayload
): Promise<SubmitArtisanReviewResponse> {
  return apiClient.post<SubmitArtisanReviewResponse, SubmitArtisanReviewPayload>(
    `/talent/enrollments/${enrollmentId}/review`,
    payload
  );
}

/**
 * Read an authorized programme conversation
 */
export async function getProgramMessagesApi(
  programId: string,
  params?: { cursor?: string; limit?: number }
): Promise<TalentMessage[]> {
  return apiClient.get<TalentMessage[]>(`/talent/programs/${programId}/messages`, {
    params,
  });
}

/**
 * Enquire about a programme or message its artisan
 */
export async function sendProgramMessageApi(
  programId: string,
  payload: SendTalentMessagePayload
): Promise<TalentMessage> {
  return apiClient.post<TalentMessage, SendTalentMessagePayload>(
    `/talent/programs/${programId}/messages`,
    payload
  );
}

/**
 * Request a refund within the first 30 training days
 */
export async function requestTalentRefundApi(
  enrollmentId: string,
  payload: RequestTalentRefundPayload
): Promise<RequestTalentRefundResponse> {
  return apiClient.post<RequestTalentRefundResponse, RequestTalentRefundPayload>(
    `/talent/enrollments/${enrollmentId}/refunds`,
    payload
  );
}

