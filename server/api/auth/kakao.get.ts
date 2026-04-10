import { generateState } from "../../utils/oauth";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  const state = generateState();

  const params = new URLSearchParams({
    client_id: config.kakaoClientId,
    redirect_uri: config.kakaoRedirectUri,
    response_type: "code",
    state,
  });

  return sendRedirect(
    event,
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`,
    302,
  );
});
