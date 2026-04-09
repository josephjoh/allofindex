import type { LoginCredentials, AuthSession } from "~/types/auth";

export const useAuth = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  const { error: notifyError } = useNotification();
  const api = useApi();

  const login = async (credentials: LoginCredentials) => {
    try {
      const session = await api.post<AuthSession, LoginCredentials>(
        "/api/auth/login",
        credentials,
      );
      authStore.setSession(session);
      await router.push("/");
    } catch {
      notifyError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // 로그아웃 API 실패 시에도 클라이언트 세션은 초기화
    } finally {
      authStore.clearSession();
      await router.push("/auth/login");
    }
  };

  return {
    login,
    logout,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
  };
};
