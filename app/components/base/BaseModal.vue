<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  title: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const close = () => emit("update:modelValue", false);

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

// ESC 키로 모달 닫기
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && props.modelValue) close();
  };
  document.addEventListener("keydown", handleKeydown);
  onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- 백드롭 -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <!-- 모달 패널 -->
        <div
          :class="[
            'relative w-full rounded-xl bg-white dark:bg-gray-800 shadow-xl',
            sizeClasses[size],
          ]"
          role="dialog"
          aria-modal="true"
        >
          <!-- 헤더 -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4"
          >
            <slot name="header">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h2>
            </slot>
            <button
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="close"
            >
              <span class="sr-only">닫기</span>
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- 본문 -->
          <div class="px-6 py-4">
            <slot />
          </div>

          <!-- 푸터 -->
          <div
            v-if="$slots.footer"
            class="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
