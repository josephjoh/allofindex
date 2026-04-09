<script setup lang="ts">
const { notifications } = useNotification();
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- 전역 알림 오버레이 — 레이아웃 슬롯 외부에서 렌더링 -->
  <AppNotification :notifications="notifications" />
</template>
