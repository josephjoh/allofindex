import type { UseFetchOptions } from "nuxt/app";

/**
 * useFetchOptions — useFetch 호출에 공통 인터셉터를 주입하는 options 팩토리
 *
 * useFetch는 $fetch.create() 같은 pre-configured 인스턴스를 지원하지 않으므로
 * 매 호출 시 options로 콜백을 전달해야 합니다.
 *
 * 사용법:
 *   useFetch('/api/foo', {
 *     ...useFetchOptions<FooType>(),
 *     key: 'foo',        // 개별 옵션은 spread 뒤에 써서 override
 *     params: { id: 1 },
 *   })
 */
export const useFetchOptions = <T = unknown>(
  overrides: UseFetchOptions<T> = {},
): UseFetchOptions<T> => {
  const {
    onRequest,
    onResponse,
    onResponseError: baseOnResponseError,
  } = useInterceptors();
  const { error: notifyError } = useNotification();

  return {
    onRequest,
    onResponse,
    onResponseError: async (ctx) => {
      // 공통 처리 먼저: 401 쿠키 초기화 + 리다이렉트 (클라이언트)
      await baseOnResponseError(ctx);

      // useFetch는 catch 블록이 없으므로 여기서 에러 toast 처리
      // useApi의 catch 블록과 중복되지 않음 (각각 다른 경로)
      if (ctx.response.status !== 401) {
        const message =
          (ctx.response._data as { message?: string } | undefined)?.message ??
          `오류가 발생했습니다. (${ctx.response.status})`;
        notifyError(message);
      }
    },
    // 개별 호출의 key, params, lazy 등이 공통 옵션을 override
    ...overrides,
  };
};
