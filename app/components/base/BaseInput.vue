<script setup lang="ts">
interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "text",
  modelValue: undefined,
  label: undefined,
  placeholder: undefined,
  error: undefined,
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'block w-full rounded-lg border px-3 py-2 text-sm',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-950'
          : 'border-gray-300 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:border-gray-600',
        'text-gray-900 dark:text-gray-100 placeholder:text-gray-400',
      ]"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />

    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>
