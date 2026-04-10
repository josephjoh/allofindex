import { generateState } from "../../utils/oauth";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  const state = generateState();

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  return sendRedirect(
    event,
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302,
  );
});
