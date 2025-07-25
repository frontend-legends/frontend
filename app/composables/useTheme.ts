import { useQuasar } from "quasar";

export function useDarkMode() {
  const $q = useQuasar();

  const init = () => {
    const stored = localStorage.getItem("q-dark-mode");

    if (stored === "true") {
      $q.dark.set(true);
    } else if (stored === "false") {
      $q.dark.set(false);
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
