// Scroll to the #heading on the first load of a page (opened link, reload, shared URL).
// Nuxt's default scrollBehavior scrolls to the hash immediately on the initial navigation,
// but here the app is a SPA and the story is fetched in AppContent (await useAsyncData),
// so the heading isn't in the DOM yet and the scroll is silently skipped.
// In-app navigation is fine: there Nuxt waits for the page to load before scrolling.
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  nuxtApp.hooks.hookOnce("page:finish", () => {
    const hash = router.currentRoute.value.hash.slice(1);
    if (!hash) return;

    let id = hash;
    try {
      id = decodeURIComponent(hash);
    } catch {
      /* already decoded */
    }

    // next frame: the page is painted, so the target's offset is final
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  });
});
