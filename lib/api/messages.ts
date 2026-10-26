import { apiClient } from "./client";
import { Conversation, ChatMessage } from "@/types/customer";

/**
 * List active conversations with latest message and unread count
 */
export async function getConversationsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<Conversation[]> {
  return apiClient.get<Conversation[]>("/conversations", { params });
}

/**
 * Load conversation history for a quote
 */
export async function getQuoteMessagesApi(
  quoteId: string,
  params?: { cursor?: string; limit?: number }
): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(`/quotes/${quoteId}/messages`, { params });
}

/**
 * Persist and broadcast a message idempotently
 */
export async function sendQuoteMessageApi(
  quoteId: string,
  payload: {
    text: string;
    mediaIds?: string[];
    clientId: string;
  }
): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(`/quotes/${quoteId}/messages`, {
    text: payload.text,
    mediaIds: payload.mediaIds || [],
    clientId: payload.clientId,
  });
}

/**
 * Update conversation read position
 */
export async function markQuoteMessagesReadApi(quoteId: string): Promise<{ id: string; readAt: string }> {
  return apiClient.post<{ id: string; readAt: string }>(`/quotes/${quoteId}/read`, {});
}

/**
 * Block new interactions with a user
 */
export async function blockUserApi(userId: string): Promise<{ id: string; userId: string; blockedId: string }> {
  return apiClient.post<{ id: string; userId: string; blockedId: string }>("/blocks", { userId });
}

/**
 * Unblock a user
 */
export async function unblockUserApi(blockId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/blocks/${blockId}`);
}
