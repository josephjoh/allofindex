<script setup lang="ts">
import type { Theme } from "~/stores/ui";

const uiStore = useUiStore();

const options: { value: Theme; title: string }[] = [
  { value: "light", title: "Light mode" },
  { value: "dark", title: "Dark mode" },
  { value: "system", title: "System default" },
];
</script>

<template>
  <div
    class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-0.5 gap-0.5"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      :title="opt.title"
      :aria-label="opt.title"
      :class="[
        'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150',
        uiStore.theme === opt.value
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
      ]"
      @click="uiStore.setTheme(opt.value)"
    >
      <!-- Light: 태양 -->
      <svg
        v-if="opt.value === 'light'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-4 h-4"
      >
        <path
          d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 011.061 1.06L5.636 8.818a.75.75 0 01-1.06-1.061l1.59-1.59z"
        />
      </svg>

      <!-- Dark: 달 -->
      <svg
        v-else-if="opt.value === 'dark'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-4 h-4"
      >
        <path
          fill-rule="evenodd"
          d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
          clip-rule="evenodd"
        />
      </svg>

      <!-- System: 모니터 -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-4 h-4"
      >
        <path
          fill-rule="evenodd"
          d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3.75v1.5h1.5a.75.75 0 010 1.5H7.5a.75.75 0 010-1.5h1.5V18H5.25a3 3 0 01-3-3V5.25zm3 0a1.5 1.5 0 00-1.5 1.5V15a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H5.25z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>
