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
          Fear & Greed Index에 오신 것을 환영합니다
        </p>
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
          로그인
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
