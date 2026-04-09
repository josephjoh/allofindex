export type Theme = "light" | "dark" | "system";

export const useUiStore = defineStore("ui", () => {
  // State
  const theme = ref<Theme>("system");
  const mobileMenuOpen = ref(false);

  // Actions
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    if (import.meta.client) {
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    }
  };

  const applyTheme = (t: Theme) => {
    const isDark =
      t === "dark" ||
      (t === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  };

  const initTheme = () => {
    if (!import.meta.client) return;
    const saved = localStorage.getItem("theme") as Theme | null;
    setTheme(saved ?? "system");

    // 시스템 다크 모드 변경 감지
    if (!saved || saved === "system") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
          if (theme.value === "system") applyTheme("system");
        });
    }
  };

  return {
    theme: readonly(theme),
    mobileMenuOpen,
    setTheme,
    initTheme,
  };
});
