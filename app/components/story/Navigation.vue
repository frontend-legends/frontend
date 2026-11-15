<script setup lang="ts">
import type { Ref } from "vue";

const { order } = defineProps<{
  order: number;
}>();

// Provided by AppContent: the page frontmatter, for the «обновлено» date in the utility row.
const page = inject<Ref<{ date?: string | Date } | null> | null>("contentPage", null);
const updated = computed(() => formatRuDate(page?.value?.date));

type NavItem = { id: string; title: string; path: string; order: number; stem?: string };
const nav = ref<NavItem[]>([]);
// index page of the next chapter: where the last story of a chapter leads
const nextChapter = ref<NavItem | null>(null);

async function fetchNav() {
  const [around, chapterAfter] = await Promise.all([
    queryCollection('content')
      .where('order', 'BETWEEN', [Number(order - 0.01).toFixed(2), Number(order + 0.01).toFixed(2)])
      .select('id', 'title', 'path', 'order', 'stem')
      .order('order', 'ASC')
      .all(),
    queryCollection('content')
      .where('order', '=', String(Math.floor(order) + 1))
      .select('id', 'title', 'path', 'order', 'stem')
      .first(),
  ]);
  nav.value = around as NavItem[];
  nextChapter.value = (chapterAfter as NavItem | null) ?? null;
}

watch(() => order, fetchNav, { immediate: true });

const prev = computed(() => nav.value.find((i) => i.order < order));
const next = computed(() => nav.value.find((i) => i.order > order));
const current = computed(() => nav.value.find((i) => i.order === order));

// content mirrors github.com/frontend-legends/content on `main`
const REPO = 'https://github.com/frontend-legends/content';
const editUrl = computed(() => (current.value?.stem ? `${REPO}/edit/main/${current.value.stem}.md` : REPO));
const issueUrl = computed(() => {
  const c = current.value;
  if (!c) return `${REPO}/issues/new`;
  const title = `[${Number(c.order).toFixed(2)}] ${c.title}: `;
  const body = `Страница: https://frontend-legends.com/content${c.path}\nФайл: ${c.stem ?? ''}.md\n\nЧто не так:\n\nКак должно быть:\n`;
  return `${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
});

const fmt = (o: number) => Number(o).toFixed(2);

// the forward step is the primary action:
//  chapter page → its first story («начать главу»); story → next story («дальше»);
//  last story → next chapter («следующая глава»); last story of the book → back («назад»)
const isChapterPage = computed(() => Number.isInteger(Number(order)));
const forward = computed(() => next.value ?? nextChapter.value ?? undefined);
const primary = computed(() => forward.value ?? prev.value);
const primaryIsNext = computed(() => !!forward.value);
const primaryLabel = computed(() => {
  if (!forward.value) return 'назад';
  if (!next.value) return 'следующая глава';
  return isChapterPage.value ? 'начать главу' : 'дальше';
});
const secondary = computed(() => (forward.value ? prev.value : undefined));
</script>

<template>
  <nav v-if="nav.length" class="fl-nav mt-24" aria-label="Навигация по главе">
    <div class="fl-nav__meta">
      <a :href="editUrl" target="_blank" rel="noopener noreferrer" class="fl-nav__meta-link">
        <Icon name="ph:github-logo-bold" aria-hidden="true" />
        <span>edit on github</span>
        <Icon name="ph:arrow-up-right-bold" class="fl-nav__ext" aria-hidden="true" />
      </a>
      <a :href="issueUrl" target="_blank" rel="noopener noreferrer" class="fl-nav__meta-link">
        <Icon name="ph:flag-bold" aria-hidden="true" />
        <span>report an issue</span>
        <Icon name="ph:arrow-up-right-bold" class="fl-nav__ext" aria-hidden="true" />
      </a>
      <span v-if="updated" class="fl-nav__updated">обновлено {{ updated }}</span>

      <NuxtLink v-if="secondary" :to="`/content${secondary.path}`" class="fl-nav__meta-link fl-nav__back" rel="prev">
        <Icon name="ph:arrow-left-bold" class="fl-nav__back-arrow" aria-hidden="true" />
        <span class="fl-nav__back-num">{{ fmt(secondary.order) }}</span>
        <span>{{ String(secondary.title).toLowerCase() }}</span>
      </NuxtLink>
    </div>

    <!-- the bookend: same language as the page header (ProseH1) -->
    <NuxtLink v-if="primary" :to="`/content${primary.path}`" class="fl-nav__next fl-slab bg-on-light text-on-dark"
      :rel="primaryIsNext ? 'next' : 'prev'">
      <span class="fl-nav__watermark" aria-hidden="true">{{ fmt(primary.order) }}</span>

      <span class="fl-nav__next-body">
        <span class="fl-nav__next-label">{{ primaryLabel }}</span>
        <span class="fl-nav__next-title">{{ primary.title }}</span>
      </span>

      <span class="fl-nav__next-arrow" aria-hidden="true">
        <Icon :name="primaryIsNext ? 'ph:arrow-right-bold' : 'ph:arrow-left-bold'" />
      </span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.fl-nav {
  max-width: 768px;
}

/* utility row: quiet links, same voice as "copy page" / "share" */
.fl-nav__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.75rem;
  padding: 1rem 0 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-nav__meta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  font-family: var(--font-main);
  font-size: 12px;
  text-decoration: none;
  color: var(--gray);
}

.fl-nav__meta-link:hover {
  color: var(--on-light);
}

.fl-nav__meta-link:focus-visible,
.fl-nav__next:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

/* plain text, not a link; font-sans: Space Grotesk (font-main) has no Cyrillic */
.fl-nav__updated {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--gray);
}

.fl-nav__ext {
  width: 11px;
  height: 11px;
  opacity: 0.6;
}

/* previous page: pushed to the right end of the utility row */
.fl-nav__back {
  margin-left: auto;
}

.fl-nav__back-num {
  opacity: 0.6;
}

/* primary block: inverted slab with the oversized blurred number, like the page header */
.fl-nav__next {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 180px;
  padding: 1.5rem;

  text-decoration: none;
}

.fl-nav__watermark {
  position: absolute;
  left: 0;
  bottom: -40px;
  z-index: 0;

  font-family: var(--font-main);
  font-size: clamp(110px, 20vw, 164px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  white-space: nowrap;

  opacity: 0.08;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.fl-nav__next-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.fl-nav__next-label {
  font-family: var(--font-sans);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  opacity: 0.8;
}

.fl-nav__next-title {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.9375rem;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* square arrow tile — same shape as the header's copy-page button */
.fl-nav__next-arrow {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;

  background-color: color-mix(in srgb, var(--on-dark) 12%, transparent);
}

.fl-nav__next:hover .fl-nav__watermark {
  opacity: 0.12;
  filter: blur(0.5px);
}

.fl-nav__next:hover .fl-nav__next-arrow {
  background-color: color-mix(in srgb, var(--on-dark) 22%, transparent);
}

.fl-nav__next:hover .fl-nav__next-arrow svg {
  transform: translateX(3px);
}

@media (min-width: 640px) {
  .fl-nav__next {
    padding: 1.5rem;
  }

  .fl-nav__next-title {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .fl-nav__watermark {
    transition: opacity 0.5s ease, filter 0.5s ease;
  }

  .fl-nav__next-arrow,
  .fl-nav__meta-link {
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .fl-nav__next-arrow svg {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}
</style>
