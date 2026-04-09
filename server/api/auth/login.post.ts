import type { LoginRequest } from "../../../shared/types/index";
import { login } from "../../utils/auth-store";

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequest>(event);

  // 유효성 검사
  if (!body?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "유효한 이메일 형식이 아닙니다.",
      data: { code: "INVALID_PARAMS" },
    });
  }
  if (!body?.password || body.password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "비밀번호는 8자 이상이어야 합니다.",
      data: { code: "INVALID_PARAMS" },
    });
  }

  try {
    // TODO: DB 연동 후 아래 mock을 교체
    // SELECT id, email, roles, password_hash FROM users
    // WHERE email = ? AND deleted_at IS NULL
    // → bcrypt.compare(password, password_hash)
    const result = login(body.email, body.password);

    // auth_token 쿠키 발급
    setCookie(event, "auth_token", result.tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: result.tokens.expiresIn,
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    });

    return { data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      throw createError({
        statusCode: 401,
        statusMessage: "이메일 또는 비밀번호가 일치하지 않습니다.",
        data: { code: "UNAUTHENTICATED" },
      });
    }
    throw createError({ statusCode: 500, statusMessage: "로그인 처리 중 오류가 발생했습니다." });
  }
});
