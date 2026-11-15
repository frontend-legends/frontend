// Оглавление открытой статьи: плоский список h2 + h3 и разделы, которые сейчас на экране.
// Общий источник для TOC в сайдбаре (desktop) и оглавления в меню (mobile).
import type { Ref } from "vue";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

// the slice of a @nuxt/content page this needs: body.toc.links (h2) with children (h3)
type TocLink = { id: string; text: string; children?: TocLink[] };
type TocPage = { body?: { toc?: { links?: TocLink[] } } } | null | undefined;

// fixed header + the heading's scroll-margin: a section scrolled under the header is not "on screen"
const HEADER_OFFSET = 80;

export function useStoryToc(page: Ref<TocPage>) {
  const items = computed<TocItem[]>(() =>
    (page.value?.body?.toc?.links ?? []).flatMap((cat) => [
      { id: cat.id, text: cat.text, depth: 2 as const },
      ...(cat.children ?? []).map((child) => ({ id: child.id, text: child.text, depth: 3 as const })),
    ]),
  );

  // every section that is currently on screen is "active" (not just one)
  const activeIds = ref<string[]>([]);
  const isActive = (id: string) => activeIds.value.includes(id);

  function updateActive() {
    const vh = window.innerHeight;
    const els = items.value.map((it) => document.getElementById(it.id));
    const contentEnd = document.querySelector(".prose")?.getBoundingClientRect().bottom ?? vh;
    const next: string[] = [];

    els.forEach((el, i) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const nextEl = els.slice(i + 1).find(Boolean);
      const bottom = nextEl ? nextEl.getBoundingClientRect().top : contentEnd;
      if (bottom > HEADER_OFFSET && top < vh) next.push(items.value[i]!.id);
    });

    activeIds.value = next;
  }

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  };

  onMounted(() => {
    nextTick(updateActive);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  });

  watch(items, () => nextTick(updateActive));

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  });

  return { items, activeIds, isActive };
}
