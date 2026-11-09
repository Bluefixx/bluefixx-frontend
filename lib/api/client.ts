import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiErrorEnvelope } from "@/types/api";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = cleanBaseUrl.endsWith("/api/v1") ? cleanBaseUrl : `${cleanBaseUrl}/api/v1`;

// ── In-Memory Access Token Store ──────────────────────────────
let inMemoryAccessToken: string | null = null;
let onAuthFailureCallback: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("bluefixx_access_token", token);
      localStorage.setItem("bluefixx_access_token", token);
    } else {
      sessionStorage.removeItem("bluefixx_access_token");
      localStorage.removeItem("bluefixx_access_token");
    }
  }
}

export function getAccessToken(): string | null {
  if (!inMemoryAccessToken && typeof window !== "undefined") {
    inMemoryAccessToken =
      sessionStorage.getItem("bluefixx_access_token") ||
      localStorage.getItem("bluefixx_access_token");
  }
  return inMemoryAccessToken;
}

export function setOnAuthFailure(callback: () => void) {
  onAuthFailureCallback = callback;
}

// ── Custom ApiError Class ─────────────────────────────────────
export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, code: string = "UNKNOWN_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ── Refresh Queue Management ──────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

// ── Axios Instance ────────────────────────────────────────────
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send HttpOnly refresh cookies automatically
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request Interceptor: Attach Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Token Refresh & Error Normalization
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Check if error response is 401 and request hasn't been retried yet
    const is401 = error.response?.status === 401;
    const url = originalRequest?.url || "";
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");

    if (is401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{
          accessToken: string;
          tokenType: string;
          expiresIn: number;
        }>(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const data = error.response?.data as ApiErrorEnvelope | { message?: string; code?: string } | undefined;

    const code =
      (data as ApiErrorEnvelope)?.error?.code ||
      (data as { code?: string })?.code ||
      error.code ||
      "REQUEST_FAILED";

    const message =
      (data as ApiErrorEnvelope)?.error?.message ||
      (data as { message?: string })?.message ||
      error.message ||
      "An unexpected server error occurred.";

    const details = (data as ApiErrorEnvelope)?.error?.details;

    return new ApiError(message, status, code, details);
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    error instanceof Error ? error.message : "An unexpected error occurred.",
    500,
    "INTERNAL_ERROR"
  );
}

// ── Generic Typed Client Wrapper ──────────────────────────────
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  },

  post: async <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.post<T>(url, data, config);
    return res.data;
  },

  patch: async <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.patch<T>(url, data, config);
    return res.data;
  },

  put: async <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.put<T>(url, data, config);
    return res.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.delete<T>(url, config);
    return res.data;
  },
};
