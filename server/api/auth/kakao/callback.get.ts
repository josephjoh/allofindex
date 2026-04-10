import { validateState } from "../../../utils/oauth";

interface KakaoTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

interface KakaoProfile {
  id: number;
  kakao_account?: {
    email?: string;
    email_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
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
  const tokenRes = await $fetch<KakaoTokenResponse>(
    "https://kauth.kakao.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.kakaoClientId,
        client_secret: config.kakaoClientSecret,
        redirect_uri: config.kakaoRedirectUri,
        code,
      }).toString(),
    },
  ).catch(() => {
    throw createError({ statusCode: 502, statusMessage: "Kakao 토큰 교환에 실패했습니다." });
  });

  // 2. access_token → 프로필 조회
  const profile = await $fetch<KakaoProfile>(
    "https://kapi.kakao.com/v2/user/me",
    {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    },
  ).catch(() => {
    throw createError({ statusCode: 502, statusMessage: "Kakao 프로필 조회에 실패했습니다." });
  });

  // 카카오 프로필 파싱
  const providerId = String(profile.id);
  const email = profile.kakao_account?.email ?? null; // 이메일 미동의 시 null
  const displayName = profile.kakao_account?.profile?.nickname ?? "카카오 사용자";
  const avatarUrl = profile.kakao_account?.profile?.profile_image_url ?? null;

  // 이메일 미동의 시 가상 이메일 생성
  const resolvedEmail = email ?? `kakao_${providerId}@kakao.local`;

  // 3. TODO: Spring Boot 연동 후 아래 mock을 교체
  // POST ${config.springApiBase}/api/users/social-login
  // body: { provider: "kakao", providerId, email: resolvedEmail, displayName, avatarUrl }
  // → { accessToken, expiresIn, user }

  // mock: 임시 토큰 발급 (Spring Boot 연동 전)
  const accessToken = `kakao-mock-${providerId}-${Date.now()}`;

  setCookie(event, "auth_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 86400,
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  });

  return sendRedirect(event, "/dashboard", 302);
});
