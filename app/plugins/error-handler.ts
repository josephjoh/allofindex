export default defineNuxtPlugin((nuxtApp) => {
  // 전역 Vue 에러 핸들러
  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => {
    console.error("[Vue Error]", { err, info });
    // 프로덕션 환경에서는 Sentry 등 에러 트래킹 서비스로 전송
    // if (import.meta.env.PROD) { Sentry.captureException(err) }
  };

  // Nuxt 앱 훅 — 처리되지 않은 에러
  nuxtApp.hook("vue:error", (err) => {
    console.error("[Nuxt Vue Error]", err);
  });
});
