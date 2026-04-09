export default defineEventHandler((event) => {
  const start = Date.now();
  const method = event.method;
  const url = event.path;

  // 응답 완료 후 로그 기록
  event.waitUntil(
    Promise.resolve().then(() => {
      const duration = Date.now() - start;
      console.warn(`[${method}] ${url} — ${duration}ms`);
    }),
  );
});
