import { validateState } from "../../../utils/oauth";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
}

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query["code"] as string | undefined;
  const state = query["state"] as string | undefined;
  const errorParam = query["error"] as string | undefined;

  // 사용자가 동의 거부한 경우
  if (errorParam) {
    return sendRedirect(event, "/auth/login?error=cancelled", 302);
  }

  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: "잘못된 콜백 요청입니다." });
  }

  // CSRF state 검증
  if (!validateState(state)) {
    throw createError({ statusCode: 400, statusMessage: "유효하지 않은 state입니다." });
  }

  const config = useRuntimeConfig();

  // 1. code → access_token 교환
  const tokenRes = await $fetch<GoogleTokenResponse>(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      body: {
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: "authorization_code",
      },
    },
  ).catch(() => {
    throw createError({ statusCode: 502, statusMessage: "Google 토큰 교환에 실패했습니다." });
  });

  // 2. access_token → 프로필 조회
  const profile = await $fetch<GoogleProfile>(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    },
  ).catch(() => {
    throw createError({ statusCode: 502, statusMessage: "Google 프로필 조회에 실패했습니다." });
  });

  // 3. TODO: Spring Boot 연동 후 아래 mock을 교체
  // POST ${config.springApiBase}/api/users/social-login
  // body: { provider: "google", providerId: profile.sub, email: profile.email,
  //         displayName: profile.name, avatarUrl: profile.picture }
  // → { accessToken, expiresIn, user }

  // mock: 임시 토큰 발급 (Spring Boot 연동 전)
  const { login } = await import("../../../utils/auth-store");
  let accessToken: string;
  try {
    // 기존 mock 유저 중 일치하는 이메일이 있으면 로그인
    const result = login(profile.email, "password123");
    accessToken = result.tokens.accessToken;
  } catch {
    // mock에 없는 유저는 임시 토큰 생성
    accessToken = `google-mock-${profile.sub}-${Date.now()}`;
  }

  setCookie(event, "auth_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 86400,
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  });

  return sendRedirect(event, "/dashboard", 302);
});
