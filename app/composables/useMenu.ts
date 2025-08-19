import { ref, type Ref } from "vue";
import { useScrollLock } from "@vueuse/core";

const isMenuVisible: Ref<boolean> = ref(false);
const html = document.documentElement; // <html> element
const isScrollLocked = useScrollLock(html);

export default function useMenu() {
  function toggleMenu(state?: boolean) {
    isMenuVisible.value = state ?? !isMenuVisible.value;
    isScrollLocked.value = isMenuVisible.value;
  }

  return { toggleMenu, isMenuVisible };
}
