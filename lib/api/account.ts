import { apiClient } from "./client";
import {
  AccountProfile,
  UpdateAccountRequest,
  SavedAddress,
  CreateAddressRequest,
  UserSession,
  UserRoleInfo,
  RoleSwitchResponse,
} from "@/types/customer";

/**
 * Get the current account profile details
 */
export async function getAccountProfileApi(): Promise<AccountProfile> {
  return apiClient.get<AccountProfile>("/account");
}

/**
 * Update the account profile details
 */
export async function updateAccountProfileApi(
  payload: UpdateAccountRequest
): Promise<AccountProfile> {
  const body: Record<string, unknown> = {
    ...(payload.fullName ? { fullName: payload.fullName } : {}),
    ...(payload.photoId || payload.avatarId
      ? { photoId: payload.photoId || payload.avatarId }
      : {}),
    language: payload.language || "en",
    ...(payload.emergencyName
      ? { emergencyName: payload.emergencyName }
      : payload.emergencyContact?.name
      ? { emergencyName: payload.emergencyContact.name }
      : {}),
    ...(payload.emergencyPhone
      ? { emergencyPhone: payload.emergencyPhone }
      : payload.emergencyContact?.phone
      ? { emergencyPhone: payload.emergencyContact.phone }
      : {}),
  };
  return apiClient.patch<AccountProfile>("/account", body);
}

/**
 * Get all saved user addresses
 */
export async function getSavedAddressesApi(): Promise<SavedAddress[]> {
  return apiClient.get<SavedAddress[]>("/addresses");
}

export interface BackendAddressPayload {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  instructions?: string;
  isDefault?: boolean;
}

/**
 * Add a new saved address
 */
export async function createSavedAddressApi(
  payload: CreateAddressRequest | BackendAddressPayload
): Promise<SavedAddress> {
  const body: BackendAddressPayload =
    "label" in payload
      ? payload
      : {
          label: payload.title,
          address: [payload.street, payload.area, payload.city, payload.state].filter(Boolean).join(", "),
          latitude: payload.latitude,
          longitude: payload.longitude,
          isDefault: payload.isDefault,
        };
  return apiClient.post<SavedAddress>("/addresses", body);
}

/**
 * Delete a saved address
 */
export async function deleteSavedAddressApi(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/addresses/${id}`);
}

/**
 * Request a phone change challenge
 */
export async function requestPhoneChangeChallengeApi(
  phone: string
): Promise<{ challengeId: string }> {
  return apiClient.post<{ challengeId: string }>("/account/phone/challenges", { phone });
}

/**
 * Confirm phone change with verification code
 */
export async function confirmPhoneChangeApi(payload: {
  challengeId: string;
  code: string;
}): Promise<{ success: boolean }> {
  return apiClient.post<{ success: boolean }>("/account/phone/confirm", payload);
}

/**
 * Set or change 4-digit transaction PIN
 */
export async function setTransactionPinApi(payload: {
  pin: string;
  currentPin?: string;
}): Promise<{ success?: boolean; message?: string }> {
  return apiClient.post<{ success?: boolean; message?: string }>("/account/pin", payload);
}

/**
 * Request a security challenge OTP for protected operations
 */
export async function requestSecurityChallengeApi(
  action: string
): Promise<{ challengeId: string }> {
  return apiClient.post<{ challengeId: string }>("/account/challenges", { action });
}

/**
 * Confirm security challenge OTP
 */
export async function confirmSecurityChallengeApi(payload: {
  challengeId: string;
  code: string;
}): Promise<{ verified: boolean }> {
  return apiClient.post<{ verified: boolean }>("/account/challenges/confirm", payload);
}

/**
 * List active sessions
 */
export async function getAccountSessionsApi(): Promise<UserSession[]> {
  return apiClient.get<UserSession[]>("/account/sessions");
}

/**
 * Revoke a specific active session
 */
export async function revokeAccountSessionApi(
  id: string
): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/account/sessions/${id}`);
}

/**
 * List user roles and enrollment status
 */
export async function getAccountRolesApi(): Promise<UserRoleInfo[]> {
  return apiClient.get<UserRoleInfo[]>("/account/roles");
}

/**
 * Enroll in a new user role
 */
export async function enrollAccountRoleApi(
  role: "CUSTOMER" | "ARTISAN" | "LEARNER"
): Promise<RoleSwitchResponse> {
  return apiClient.post<RoleSwitchResponse>("/account/roles", { role });
}

/**
 * Switch the active role
 */
export async function switchActiveRoleApi(
  role: "CUSTOMER" | "ARTISAN" | "LEARNER"
): Promise<RoleSwitchResponse> {
  return apiClient.patch<RoleSwitchResponse>("/account/active-role", { role });
}
