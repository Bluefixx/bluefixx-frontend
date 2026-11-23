import { apiClient } from "./client";
import {
  MediaPurpose,
  MediaResourceType,
  MediaUploadInitiateRequest,
  MediaUploadInitiateResponse,
  MediaUrlResponse,
} from "@/types/customer";

/**
 * Purposes whose binary is stored as a Cloudinary `video` resource.
 * VOICE is audio-only, EVIDENCE and ASSESSMENT accept video clips.
 */
const VIDEO_PURPOSES: ReadonlySet<MediaPurpose> = new Set<MediaPurpose>([
  "VOICE",
  "EVIDENCE",
  "ASSESSMENT",
]);

const SUPPORTED_IMAGE_MIME_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/avif",
]);

/** Map an upload purpose to the Cloudinary resource type the backend expects. */
export function mediaResourceTypeFor(purpose: MediaPurpose, file?: File): MediaResourceType {
  if (purpose === "VOICE") return "video";
  if (file && (purpose === "PORTFOLIO" || purpose === "CHAT")) {
    const mime = file.type.toLowerCase();
    if (SUPPORTED_IMAGE_MIME_TYPES.has(mime)) return "image";
    if (mime.startsWith("video/") || mime.startsWith("audio/")) return "video";
    return "raw";
  }
  return VIDEO_PURPOSES.has(purpose) ? "video" : "image";
}

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
 * High-level helper to upload a File or Blob directly to Cloudinary using the
 * signed fields returned by `POST /media`, then verify and resolve its URL.
 */
export async function uploadMediaFile(
  file: File,
  purpose: MediaPurpose
): Promise<{ id: string; url?: string; resourceType: MediaResourceType }> {
  const resourceType = mediaResourceTypeFor(purpose, file);
  try {
    const initRes = await initiateMediaUploadApi({
      purpose,
      resourceType: mediaResourceTypeFor(purpose, file),
    });

    // Upload the binary to the signed provider URL using the returned fields.
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(initRes.fields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const uploadRes = await fetch(initRes.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Media upload failed with status ${uploadRes.status}`);
    }

    await completeMediaUploadApi(initRes.id);

    try {
      const urlRes = await getMediaUrlApi(initRes.id);
      return { id: initRes.id, url: urlRes.url, resourceType };
    } catch {
      return { id: initRes.id, resourceType };
    }
  } catch (error) {
    // When mocks are active or storage is unavailable locally, generate mock media ID
    if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
      const mockId = `media-${Date.now()}`;
      return { id: mockId, url: URL.createObjectURL(file), resourceType };
    }
    throw error;
  }
}
