import type { FetchOptions } from "ofetch";

/**
 * useInterceptors — 공통 인터셉터 콜백 팩토리
 *
 * $fetch.create() (useApi/플러그인)와 useFetch() options 양쪽에
 * 동일한 훅을 주입하기 위해 콜백을 반환합니다. SSR/CSR 모두 안전합니다.
 */
export const useInterceptors = () => {
  // useCookie는 서버/클라이언트 모두 동작 (SSR-safe)
  const authToken = useCookie<string | null>("auth_token");

  const onRequest: FetchOptions["onRequest"] = ({ request, options }) => {
    if (authToken.value) {
      options.headers = new Headers(options.headers as HeadersInit);
      options.headers.set("Authorization", `Bearer ${authToken.value}`);
    }

    if (import.meta.dev) {
      console.warn("[API req]", options.method?.toUpperCase(), request);
    }
  };

  const onResponse: FetchOptions["onResponse"] = ({ response }) => {
    if (import.meta.dev) {
      console.warn("[API res]", response.status, response.url);
    }
  };

  const onResponseError: FetchOptions["onResponseError"] = async ({
    response,
  }) => {
    if (import.meta.dev) {
      console.warn("[API err]", response.status, response.url);
    }

    if (response.status === 401) {
      authToken.value = null;
      // navigateTo / store 접근은 클라이언트에서만 수행
      // SSR 중에는 middleware/auth.ts 가 라우트 가드를 담당
      if (import.meta.client) {
        useAuthStore().clearSession();
        await navigateTo("/auth/login");
      }
    }
  };

  return { onRequest, onResponse, onResponseError };
};
