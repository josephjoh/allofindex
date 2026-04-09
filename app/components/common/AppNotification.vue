<script setup lang="ts">
import type { Notification } from "~/composables/useNotification";

interface Props {
  notifications: readonly Notification[];
}

defineProps<Props>();

const { dismiss } = useNotification();

const typeClasses: Record<Notification["type"], string> = {
  success:
    "bg-green-50 border-green-500 text-green-800 dark:bg-green-950 dark:text-green-200",
  error:
    "bg-red-50 border-red-500 text-red-800 dark:bg-red-950 dark:text-red-200",
  warning:
    "bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  info: "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

const typeIcons: Record<Notification["type"], string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        name="notification"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg',
            typeClasses[notification.type],
          ]"
          role="alert"
        >
          <span class="font-bold text-base leading-tight mt-0.5">
            {{ typeIcons[notification.type] }}
          </span>
          <p class="flex-1 text-sm">{{ notification.message }}</p>
          <button
            class="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            @click="dismiss(notification.id)"
          >
            <span class="sr-only">닫기</span>
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-enter-active {
  transition: all 0.3s ease-out;
}
.notification-leave-active {
  transition: all 0.2s ease-in;
}
.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
