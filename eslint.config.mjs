// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    // 전체 파일 공통 규칙
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"],
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
  },
  {
    // TypeScript 규칙은 .ts / .vue 파일에만 적용 (eslint.config.mjs 등 제외)
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
