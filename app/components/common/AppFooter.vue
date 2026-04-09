<script setup lang="ts">
const config = useRuntimeConfig();
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-auto"
  >
    <div
      class="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400"
    >
      <p>
        &copy; {{ currentYear }} {{ config.public.appName }}. All rights
        reserved.
      </p>
      <p>
        데이터 제공:
        <a
          href="https://alternative.me/crypto/fear-and-greed-index/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 dark:text-primary-400 hover:underline"
        >
          Alternative.me
        </a>
      </p>
    </div>
  </footer>
</template>
