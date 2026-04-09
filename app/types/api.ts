// API 응답 기본 래퍼 — 모든 백엔드 응답이 이 구조를 따름
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface DateRangeParams {
  from?: string; // ISO 8601
  to?: string; // ISO 8601
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<B = unknown> {
  method?: HttpMethod;
  body?: B;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}
