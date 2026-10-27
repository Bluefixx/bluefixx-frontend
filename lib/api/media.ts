import { apiClient } from "./client";
import {
  MediaType,
  MediaUploadInitiateRequest,
  MediaUploadInitiateResponse,
  MediaUrlResponse,
} from "@/types/customer";

/**
 * Initiate a media upload session
 */
export async function initiateMediaUploadApi(
  payload: MediaUploadInitiateRequest
): Promise<MediaUploadInitiateResponse> {
  return apiClient.post<MediaUploadInitiateResponse>("/media", payload);
}

/**
 * Mark a media upload as complete
 */
export async function completeMediaUploadApi(
  id: string
): Promise<{ id: string; status: string }> {
  return apiClient.post<{ id: string; status: string }>(`/media/${id}/complete`, {});
}

/**
 * Get authorized temporary access URL for an uploaded media item
 */
export async function getMediaUrlApi(id: string): Promise<MediaUrlResponse> {
  return apiClient.get<MediaUrlResponse>(`/media/${id}/url`);
}

/**
 * High-level helper to upload a File or Blob directly to BlueFixx media storage
 */
export async function uploadMediaFile(
  file: File,
  type: MediaType
): Promise<{ id: string; url?: string }> {
  try {
    const initRes = await initiateMediaUploadApi({
      type,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    if (initRes.uploadUrl) {
      // Direct binary PUT to S3 / cloud storage or backend endpoint
      await fetch(initRes.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });
    }

    await completeMediaUploadApi(initRes.id);

    try {
      const urlRes = await getMediaUrlApi(initRes.id);
      return { id: initRes.id, url: urlRes.url };
    } catch {
      return { id: initRes.id };
    }
  } catch (error) {
    // When mocks are active or storage is unavailable locally, generate mock media ID
    if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
      const mockId = `media-${Date.now()}`;
      return { id: mockId, url: URL.createObjectURL(file) };
    }
    throw error;
  }
}
