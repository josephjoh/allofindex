<script setup lang="ts">
definePageMeta({
  layout: "blank",
  middleware: "guest",
});

const { login, isLoading } = useAuth();

const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");

const route = useRoute();
const loginError = computed(() => route.query["error"] === "cancelled" ? "소셜 로그인이 취소되었습니다." : "");

const validate = () => {
  emailError.value = "";
  passwordError.value = "";

  if (!email.value) {
    emailError.value = "이메일을 입력해주세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "올바른 이메일 형식을 입력해주세요.";
  }

  if (!password.value) {
    passwordError.value = "비밀번호를 입력해주세요.";
  } else if (password.value.length < 8) {
    passwordError.value = "비밀번호는 8자 이상이어야 합니다.";
  }

  return !emailError.value && !passwordError.value;
};

const handleSubmit = async () => {
  if (!validate()) return;
  await login({ email: email.value, password: password.value });
};
</script>

<template>
  <div class="w-full max-w-sm">
    <BaseCard>
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">로그인</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          AllofIndex에 오신 것을 환영합니다
        </p>
      </div>

      <!-- 소셜 로그인 오류 메시지 -->
      <p v-if="loginError" class="text-red-500 text-sm text-center mb-4">{{ loginError }}</p>

      <!-- 소셜 로그인 버튼 -->
      <div class="space-y-3 mb-6">
        <a
          href="/api/auth/google"
          class="flex items-center justify-center gap-3 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </a>

        <a
          href="/api/auth/kakao"
          class="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style="background-color: #FEE500; color: #191919;"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.7 5.1 4.3 6.5l-1.1 4.1 4.8-3.2c.6.1 1.3.1 2 .1 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
          </svg>
          카카오로 로그인
        </a>
      </div>

      <!-- 구분선 -->
      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">또는</span>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="email"
          label="이메일"
          type="email"
          placeholder="user@example.com"
          :error="emailError"
          required
        />

        <BaseInput
          v-model="password"
          label="비밀번호"
          type="password"
          placeholder="••••••••"
          :error="passwordError"
          required
        />

        <BaseButton type="submit" class="w-full" :loading="isLoading">
          이메일로 로그인
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
