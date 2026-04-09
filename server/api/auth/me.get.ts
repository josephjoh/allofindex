import { getUserByToken } from "../../utils/auth-store";

export default defineEventHandler((event) => {
  const token = getCookie(event, "auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "인증 토큰이 없습니다.",
      data: { code: "UNAUTHENTICATED" },
    });
  }

  // TODO: DB 연동 후 JWT 검증 + users 테이블 조회로 교체
  // SELECT id, email, roles FROM users WHERE id = ? AND deleted_at IS NULL
  const user = getUserByToken(token);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "유효하지 않거나 만료된 토큰입니다.",
      data: { code: "UNAUTHENTICATED" },
    });
  }

  return { data: user };
});
