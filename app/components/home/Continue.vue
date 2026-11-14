<script setup lang="ts">
// Закрывающая плита главной после карты — тот же жест, что «дальше» в конце статьи:
// гостю — начать с первой темы, читателю — продолжить с первой непройденной.
import LINKS from "~/const/links";

const { isAuth, chapters, nextStory, totalDone, totalStories } = useBookMap();

const chapterOf = computed(() => chapters.value.find((c) => Math.floor(Number(c.order)) === Math.floor(Number(nextStory.value?.order ?? 0))));
const allDone = computed(() => isAuth.value && totalStories.value > 0 && totalDone.value === totalStories.value);
const label = computed(() => (allDone.value ? "всё пройдено — повторить с начала" : isAuth.value && totalDone.value ? "продолжить" : "начать с первой темы"));

const p2 = pad2;

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
</script>

<template>
  <nav v-if="nextStory" class="fl-end" aria-label="Что дальше">
    <div class="fl-end__meta">
      <a :href="LINKS.github" target="_blank" rel="noopener noreferrer" class="fl-end__link">
        <Icon name="ph:github-logo-bold" aria-hidden="true" />
        <span>github</span>
        <Icon name="ph:arrow-up-right-bold" class="fl-end__ext" aria-hidden="true" />
      </a>
      <a :href="LINKS.telegram" target="_blank" rel="noopener noreferrer" class="fl-end__link">
        <Icon name="ph:telegram-logo-bold" aria-hidden="true" />
        <span>telegram</span>
        <Icon name="ph:arrow-up-right-bold" class="fl-end__ext" aria-hidden="true" />
      </a>
      <button type="button" class="fl-end__link fl-end__top" @click="scrollTop">
        <Icon name="ph:arrow-up-bold" aria-hidden="true" />
        <span>наверх</span>
      </button>
    </div>

    <NuxtLink :to="`/content${nextStory.path}`" class="fl-end__slab fl-slab bg-on-light text-on-dark">
      <span class="fl-end__wm" aria-hidden="true">{{ Number(nextStory.order).toFixed(2) }}</span>
      <span class="fl-end__body">
        <span class="fl-end__label">{{ label }}</span>
        <span class="fl-end__title">{{ nextStory.title }}</span>
        <span v-if="chapterOf" class="fl-end__chapter">глава {{ p2(chapterOf.order) }} {{ chapterOf.title.toLowerCase() }}</span>
      </span>
      <span class="fl-end__tile" aria-hidden="true">
        <Icon name="ph:arrow-right-bold" />
      </span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.fl-end {
  margin: 0 0 5rem;
}

/* app.css sets `span { font-family: var(--font-main) }`: Cyrillic labels need Inter */
.fl-end :deep(span) {
  font-family: inherit;
}

/* utility row — same voice as the story footer */
.fl-end__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.75rem;
  padding: 1rem 0 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-end__link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0;
  border: 0;
  background: none;

  font-family: var(--font-main);
  font-size: 12px;
  text-decoration: none;
  color: var(--gray);
  cursor: pointer;
}

.fl-end__link:hover {
  color: var(--on-light);
}

.fl-end__ext {
  width: 11px;
  height: 11px;
  opacity: 0.6;
}

.fl-end__top {
  margin-left: auto;
  font-family: var(--font-sans);
}

.fl-end__link:focus-visible,
.fl-end__slab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

/* the slab: inverted, oversized blurred number, square arrow tile */
.fl-end__slab {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 220px;
  padding: 1.5rem;

  font-family: var(--font-sans);
  text-decoration: none;
}

.fl-end__wm {
  position: absolute;
  right: -0.04em;
  bottom: -0.22em;

  font-family: var(--font-main) !important;
  font-size: clamp(130px, 22vw, 260px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  white-space: nowrap;
  opacity: 0.08;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.fl-end__slab:hover .fl-end__wm {
  opacity: 0.12;
  filter: blur(0.5px);
}

.fl-end__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.fl-end__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  opacity: 0.75;
}

.fl-end__title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.fl-end__chapter {
  margin-top: 0.35rem;
  font-size: 13px;
  opacity: 0.65;
}

.fl-end__tile {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background-color: color-mix(in srgb, var(--on-dark) 12%, transparent);
}

.fl-end__slab:hover .fl-end__tile {
  background-color: color-mix(in srgb, var(--on-dark) 22%, transparent);
}

.fl-end__slab:hover .fl-end__tile svg {
  transform: translateX(3px);
}

@media (min-width: 640px) {
  .fl-end__slab {
    padding: 2rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .fl-end__wm {
    transition: opacity 0.5s ease, filter 0.5s ease;
  }

  .fl-end__tile,
  .fl-end__link {
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .fl-end__tile svg {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}
</style>
