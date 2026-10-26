import { apiClient } from "./client";
import { CreateJobRequest, JobPost } from "@/types/customer";

/**
 * List owned job posts
 */
export async function getJobsApi(params?: {
  cursor?: string;
  limit?: number;
  status?: string;
}): Promise<JobPost[]> {
  return apiClient.get<JobPost[]>("/jobs", { params });
}

/**
 * Get job details and competing artisan quote comparison
 */
export async function getJobByIdApi(id: string): Promise<JobPost> {
  return apiClient.get<JobPost>(`/jobs/${id}`);
}

/**
 * Create draft or broadcast a job to matching artisans
 */
export async function createJobApi(
  payload: CreateJobRequest,
  idempotencyKey?: string
): Promise<JobPost> {
  return apiClient.post<JobPost>(
    "/jobs",
    payload,
    idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
  );
}

/**
 * Edit an owned job draft
 */
export async function editJobDraftApi(
  id: string,
  payload: Partial<CreateJobRequest>
): Promise<JobPost> {
  return apiClient.patch<JobPost>(`/jobs/${id}`, payload);
}

/**
 * Publish draft and privately invite matching artisans
 */
export async function publishJobApi(id: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/jobs/${id}/publish`, {});
}

/**
 * Cancel unbooked job and close all competing requests
 */
export async function cancelJobApi(id: string, reason: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/jobs/${id}/cancel`, { reason });
}
