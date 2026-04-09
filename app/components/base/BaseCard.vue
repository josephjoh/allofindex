<script setup lang="ts">
interface Props {
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: boolean;
  border?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: "md",
  shadow: true,
  border: false,
});
</script>

<template>
  <div
    :class="[
      'rounded-card bg-white dark:bg-gray-800',
      shadow && 'shadow-card',
      border && 'border border-gray-200 dark:border-gray-700',
      padding === 'none' && 'p-0',
      padding === 'sm' && 'p-4',
      padding === 'md' && 'p-6',
      padding === 'lg' && 'p-8',
    ]"
  >
    <slot />
  </div>
</template>
