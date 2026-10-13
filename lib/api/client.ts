import { ApiResponse, ApiErrorResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  public code?: string;
  public status: number;
  public validationErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, validationErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...customConfig } = config;

  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = await response.json();
    } catch {
      // Body was not JSON
    }

    throw new ApiError(
      errorData?.message || `Request failed with status ${response.status}`,
      response.status,
      errorData?.code,
      errorData?.errors
    );
  }

  return response.json();
}
