<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const { logout } = useAuth();

// 페이지 마운트 시 자동 로그아웃
onMounted(async () => {
  await logout();
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <BaseSpinner size="lg" />
    <p class="text-gray-500 dark:text-gray-400">로그아웃 중...</p>
  </div>
</template>
