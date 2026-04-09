/**
 * apiFetch 플러그인 — 인터셉터가 적용된 $fetch 인스턴스를 앱 초기화 시 1회 생성
 *
 * $fetch.create()는 매 composable 호출마다 실행되면 안 됨.
 * 플러그인에서 1회 생성 후 $apiFetch 로 제공하면 useApi.ts 에서 재사용 가능.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { onRequest, onResponse, onResponseError } = useInterceptors();

  // 타입 추론 사용 — ofetch의 $Fetch와 Nuxt의 $fetch 타입이 달라 명시적 선언 시 충돌
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    headers: { "Content-Type": "application/json" },
    onRequest,
    onResponse,
    onResponseError,
  });

  return {
    provide: { apiFetch },
  };
});

declare module "#app" {
  interface NuxtApp {
    $apiFetch: typeof $fetch;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $apiFetch: typeof $fetch;
  }
}
