export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
  offset?: number;
}

export interface OffsetPaginationMeta {
  limit: number;
  offset: number;
  total?: number;
}
