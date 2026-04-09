// .client.ts 접미사 — 브라우저에서만 실행 (window, localStorage 접근 안전)
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const uiStore = useUiStore();

  // 저장된 쿠키에서 인증 상태 복원
  authStore.initFromCookie();

  // 저장된 테마 설정 적용
  uiStore.initTheme();
});
