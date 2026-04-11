import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",

  // Nuxt 4 호환 모드 활성화 (app/ 디렉토리 구조 사용)
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  routeRules: {
    "/": { redirect: "/dashboard" },
  },

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: false, // 별도로 `nuxt typecheck` 명령 실행
  },

  // Tailwind v4 CSS 진입점
  css: ["~/assets/css/main.css"],

  // Vite 플러그인 (Tailwind v4는 @tailwindcss/vite 사용 — @nuxtjs/tailwindcss 미사용)
  vite: {
    plugins: [tailwindcss()],
  },

  // 컴포넌트 자동 임포트 — 경로 프리픽스 없이 파일명으로만 등록
  components: {
    dirs: [
      {
        path: "~/components",
        pathPrefix: false,
      },
    ],
  },

  // Nuxt 모듈
  modules: [
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@nuxt/icon",
    // '@nuxtjs/i18n', // 필요 시 주석 해제
  ],

  // Pinia 스토어 디렉토리 설정
  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // 런타임 설정: 서버 전용 시크릿과 클라이언트 공개 설정 분리
  runtimeConfig: {
    // 서버 전용 — NUXT_API_SECRET 환경 변수로 오버라이드
    apiSecret: "",
    apiBaseUrl: "https://api.alternative.me/fng/",

    // Google OAuth (서버 전용)
    googleClientId: "",
    googleClientSecret: "",
    googleRedirectUri: "http://localhost:3000/api/auth/google/callback",

    // Kakao OAuth (서버 전용)
    kakaoClientId: "",
    kakaoClientSecret: "",
    kakaoRedirectUri: "http://localhost:3000/api/auth/kakao/callback",

    // Spring Boot API (서버 전용)
    springApiBase: "http://localhost:8081",

    public: {
      // 클라이언트 노출 가능 — NUXT_PUBLIC_* 환경 변수로 오버라이드
      apiBase: "/api",
      appName: "AllofIndex",
      appVersion: "0.1.0",
    },
  },

  // 앱 전역 head 설정
  app: {
    head: {
      title: "AllofIndex",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Real-time crypto and market fear & greed index",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // ESLint 모듈 설정 (Prettier가 스타일 담당)
  eslint: {
    config: {
      stylistic: false,
    },
  },

  // i18n 설정 (필요 시 활성화)
  // i18n: {
  //   locales: [
  //     { code: 'en', language: 'en-US', file: 'en.json' },
  //     { code: 'ko', language: 'ko-KR', file: 'ko.json' },
  //   ],
  //   defaultLocale: 'ko',
  //   langDir: 'locales/',
  //   strategy: 'prefix_except_default',
  // },
});
