<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
</script>

<template>
  <header
    class="sticky top-0 z-40 h-16 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm"
  >
    <div
      class="h-full flex items-center justify-between px-4 max-w-7xl mx-auto"
    >
      <!-- 로고 -->
      <NuxtLink
        to="/"
        class="flex items-center font-bold text-gray-900 dark:text-white"
      >
        All of Index
      </NuxtLink>

      <!-- 네비게이션 -->
      <nav class="flex items-center gap-6 text-sm font-medium">
        <NuxtLink
          to="/dashboard"
          class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          active-class="text-primary-600 dark:text-primary-400"
        >
          대시보드
        </NuxtLink>
        <NuxtLink
          to="/indices"
          class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          active-class="text-primary-600 dark:text-primary-400"
        >
          인덱스
        </NuxtLink>
        <NuxtLink
          to="/news"
          class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          active-class="text-primary-600 dark:text-primary-400"
        >
          뉴스
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          active-class="text-primary-600 dark:text-primary-400"
        >
          소개
        </NuxtLink>
      </nav>

      <!-- 우측 액션 -->
      <div class="flex items-center gap-3">
        <!-- 테마 토글 -->
        <ThemeToggle />

        <!-- 인증 버튼 -->
        <NuxtLink v-if="!authStore.isAuthenticated" to="/auth/login">
          <BaseButton size="sm" variant="secondary">로그인</BaseButton>
        </NuxtLink>
        <BaseButton
          v-else
          size="sm"
          variant="ghost"
          @click="router.push('/auth/logout')"
        >
          로그아웃
        </BaseButton>
      </div>
    </div>
  </header>
</template>
