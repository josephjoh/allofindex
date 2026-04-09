import type { FetchError } from "ofetch";
import type { ApiError, RequestOptions } from "~/types/api";

/**
 * useApi — typed $fetch 래퍼, 중앙 에러 핸들링
 *
 * SSR-safe 데이터 패칭이 필요한 경우 useFetch() / useAsyncData() 사용을 권장합니다.
 * useApi는 뮤테이션(POST/PUT/DELETE)과 클라이언트 트리거 요청에 사용합니다.
 *
 * baseURL, Content-Type, 인터셉터(onRequest/onResponse/onResponseError)는
 * plugins/apiFetch.ts 의 $apiFetch 인스턴스에서 처리합니다.
 */
export const useApi = () => {
  const { $apiFetch } = useNuxtApp();
  const { error: notifyError } = useNotification();

  async function request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, params, headers } = options;

    try {
      const data = await $apiFetch<T>(endpoint, {
        method,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        params,
        headers,
      });

      return data as T;
    } catch (err) {
      const fetchError = err as FetchError;
      const apiError: ApiError = {
        code: String(fetchError.status ?? "NETWORK_ERROR"),
        message:
          (fetchError.data as { message?: string })?.message ??
          fetchError.message ??
          "예기치 않은 오류가 발생했습니다.",
        details: (fetchError.data as { details?: Record<string, string[]> })
          ?.details,
      };

      // 401 에러 제외 — 인증 처리는 별도 로직에서 담당
      if (fetchError.status !== 401) {
        notifyError(apiError.message);
      }

      throw apiError;
    }
  }

  return {
    get: <T>(endpoint: string, params?: RequestOptions["params"]) =>
      request<T>(endpoint, { method: "GET", params }),

    post: <T, B = unknown>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: "POST", body }),

    put: <T, B = unknown>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: "PUT", body }),

    patch: <T, B = unknown>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: "PATCH", body }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  };
};
