import type { User, AuthSession, AuthTokens } from "~/types/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const tokens = ref<AuthTokens | null>(null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(
    () => user.value !== null && tokens.value !== null,
  );
  const userRoles = computed(() => user.value?.roles ?? []);
  const hasRole = (role: string) =>
    userRoles.value.includes(role as User["roles"][number]);

  // Actions
  const setSession = (session: AuthSession) => {
    user.value = session.user;
    tokens.value = session.tokens;

    // 토큰을 쿠키에 저장 (SSR-safe)
    const tokenCookie = useCookie("auth_token", {
      maxAge: session.tokens.expiresIn,
      secure: true,
      sameSite: "lax",
    });
    tokenCookie.value = session.tokens.accessToken;
  };

  const clearSession = () => {
    user.value = null;
    tokens.value = null;
    const tokenCookie = useCookie("auth_token");
    tokenCookie.value = null;
  };

  const initFromCookie = async () => {
    const tokenCookie = useCookie<string | null>("auth_token");
    if (!tokenCookie.value) return;

    isLoading.value = true;
    try {
      // 실제 구현 시: /api/auth/me 호출로 사용자 정보 조회
      // const session = await $fetch<AuthSession>('/api/auth/me')
      // setSession(session)
    } catch {
      clearSession();
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user: readonly(user),
    tokens: readonly(tokens),
    isLoading: readonly(isLoading),
    isAuthenticated,
    userRoles,
    hasRole,
    setSession,
    clearSession,
    initFromCookie,
  };
});
