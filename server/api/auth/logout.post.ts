import { logout } from "../../utils/auth-store";

export default defineEventHandler((event) => {
  const token = getCookie(event, "auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "인증 토큰이 없습니다.",
      data: { code: "UNAUTHENTICATED" },
    });
  }

  // TODO: DB 연동 시 refresh_token 테이블 무효화 처리 추가
  logout(token);

  // 쿠키 삭제
  deleteCookie(event, "auth_token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return { data: { ok: true } };
});
