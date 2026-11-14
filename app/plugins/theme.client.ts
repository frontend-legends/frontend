// Applies the theme before the app mounts, so the first frame is already in the right colours.
// Same rule as the boot screen (app/spa-loading-template.html):
//   stored choice ("q-dark-mode" in localStorage) wins; with no choice, follow the OS (prefers-color-scheme).
import { Dark } from "quasar";

export const THEME_KEY = "q-dark-mode";

export function applyStoredTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    /* storage blocked: fall back to the OS */
  }
  if (stored === "true") Dark.set(true);
  else if (stored === "false") Dark.set(false);
  else Dark.set("auto");
}

export default defineNuxtPlugin(() => {
  applyStoredTheme();
});
