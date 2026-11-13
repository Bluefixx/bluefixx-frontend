import { apiClient } from "./client";
import {
  HelpArticle,
  SupportCase,
  CreateSupportCaseRequest,
  SupportCaseMessage,
} from "@/types/customer";

/**
 * Fetch help center articles and FAQs
 */
export async function getHelpArticlesApi(): Promise<HelpArticle[]> {
  return apiClient.get<HelpArticle[]>("/help");
}

/**
 * Get all support cases (disputes, warranty claims, safety reports)
 */
export async function getSupportCasesApi(): Promise<SupportCase[]> {
  return apiClient.get<SupportCase[]>("/support/cases");
}

/**
 * File a new support case (warranty claim, dispute, or safety report)
 */
export async function createSupportCaseApi(
  payload: CreateSupportCaseRequest
): Promise<SupportCase> {
  return apiClient.post<SupportCase>("/support/cases", payload);
}

/**
 * Get full case details by ID
 */
export async function getSupportCaseByIdApi(id: string): Promise<SupportCase> {
  return apiClient.get<SupportCase>(`/support/cases/${id}`);
}

/**
 * Send a message or reply on an active support case
 */
export async function sendSupportCaseMessageApi(
  caseId: string,
  text: string,
  mediaIds?: string[]
): Promise<SupportCaseMessage> {
  return apiClient.post<SupportCaseMessage>(`/support/cases/${caseId}/messages`, {
    text,
    mediaIds: mediaIds ?? [],
  });
}

/**
 * Load the message history of a support case
 */
export async function getSupportCaseMessagesApi(
  caseId: string,
  params?: { cursor?: string; limit?: number }
): Promise<SupportCaseMessage[]> {
  return apiClient.get<SupportCaseMessage[]>(`/support/cases/${caseId}/messages`, {
    params,
  });
}

/**
 * Mark a support case conversation as read
 */
export async function markSupportCaseReadApi(
  caseId: string
): Promise<{ message?: string }> {
  return apiClient.post<{ message?: string }>(`/support/cases/${caseId}/read`, {});
}

/**
 * Open or resume the private BlueFixx live support conversation
 */
export async function openSupportChatApi(): Promise<{ conversationId: string }> {
  return apiClient.post<{ conversationId: string }>("/support/chat", {});
}

/**
 * List support chat conversations
 */
export async function getSupportConversationsApi(): Promise<unknown[]> {
  return apiClient.get<unknown[]>("/support/conversations");
}
