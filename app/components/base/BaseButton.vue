<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
});

const variantClasses: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const classes = computed(() =>
  ["btn-base", variantClasses[props.variant], sizeClasses[props.size]].join(
    " ",
  ),
);
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <BaseSpinner v-if="loading" size="sm" />
    <slot />
  </button>
</template>
