import { useQuasar } from "quasar";

export function useDarkMode() {
  const $q = useQuasar();

  // the theme is applied before mount by plugins/theme.client.ts; init() re-applies the same rule
  // (stored choice, otherwise follow the OS) for callers that still use it
  const init = () => {
    const stored = localStorage.getItem("q-dark-mode");

    if (stored === "true") {
      $q.dark.set(true);
    } else if (stored === "false") {
      $q.dark.set(false);
    } else {
      $q.dark.set("auto");
    }
  };

  const switchMode = () => {
    $q.dark.toggle();
    localStorage.setItem("q-dark-mode", $q.dark.isActive ? "true" : "false");
  };

  return {
    init,
    switchMode,
    isDark: computed(() => $q.dark.isActive),
  };
}
