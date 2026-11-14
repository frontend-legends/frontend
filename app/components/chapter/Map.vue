<script setup lang="ts">
// Оглавление главы в сайдбаре страницы главы. Язык — как у карты книги и TOC статьи:
// шапка «номер + НАЗВАНИЕ + счётчик», строки «номер · название», слева рельс.
// Рельс = прогресс: у пройденных тем его отрезок залит; на hover по рельсу растёт яркая полоса.
const route = useRoute();
const { isAuth, chapters, isCompleted } = useBookMap();

const chapter = computed(() => chapters.value.find((c) => c.path === `/${route.params.chapter}`));
const storyNum = (order: number) => pad2(Math.round((Number(order) % 1) * 100));
const p2 = pad2;
const plural = ruPlural;
</script>

<template>
  <nav v-if="chapter && chapter.children.length" class="fl-cmap" aria-label="Темы главы">
    <div class="fl-cmap__head">
      <span class="fl-cmap__num">{{ p2(chapter.order) }}</span>
      <span class="fl-cmap__title">{{ chapter.title }}</span>
      <span class="fl-cmap__meta">
        <template v-if="isAuth">{{ chapter.done }} / {{ chapter.children.length }}</template>
        <template v-else>{{ chapter.children.length }} {{ plural(chapter.children.length, "тема", "темы", "тем") }}</template>
      </span>
      <span v-if="isAuth" class="fl-cmap__progress" :style="{ '--pct': chapter.pct }" aria-hidden="true" />
    </div>

    <ol class="fl-cmap__list">
      <li v-for="s in chapter.children" :key="s.id">
        <NuxtLink :to="`/content${s.path}`" class="fl-cmap__row" :class="{ 'is-done': isCompleted(s.path) }">
          <span class="fl-cmap__n">{{ storyNum(s.order) }}</span>
          <span class="fl-cmap__t">{{ s.title.toLowerCase() }}</span>
          <span v-if="isCompleted(s.path)" class="sr-only">пройдено</span>
        </NuxtLink>
      </li>
    </ol>

    <div v-if="chapter.author" class="fl-cmap__author">автор главы: {{ chapter.author }}</div>
  </nav>
</template>

<style scoped>
.fl-cmap {
  width: 100%;
  font-family: var(--font-main);
}

/* app.css sets `span { font-family: var(--font-main) }`; keep explicit fonts below */
.fl-cmap :deep(span) {
  font-family: inherit;
}

/* ---------- head ---------- */
.fl-cmap__head {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 22%, transparent);
}

.fl-cmap__num {
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--on-light) 35%, transparent);
}

.fl-cmap .fl-cmap__title {
  min-width: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--on-light);
}

.fl-cmap__meta {
  margin-left: auto;
  white-space: nowrap;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-cmap__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: var(--on-light);
  transform: scaleX(var(--pct, 0));
  transform-origin: left;
}

/* ---------- list with a rail ---------- */
.fl-cmap__list {
  position: relative;
  margin: 0; /* the parent stacks head / list / author with a gap */
  padding: 0;
  list-style: none;
}

/* the rail */
.fl-cmap__list::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: color-mix(in srgb, var(--on-light) 16%, transparent);
}

.fl-cmap__row {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.3rem 0 0.3rem 0.9rem;

  font-family: var(--font-main); /* reset.css puts Inter on every element; titles are Space Grotesk like the home map */
  font-size: 13px;
  line-height: 1.35;
  text-decoration: none;
  color: var(--gray);
}

/* done: its piece of the rail is filled */
.fl-cmap__row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: transparent;
}

.fl-cmap__row.is-done::before {
  background-color: color-mix(in srgb, var(--on-light) 70%, transparent);
}

/* hover: a bright 2px bar grows along the rail from the top */
.fl-cmap__row::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--on-light);
  transform: scaleY(0);
  transform-origin: top;
}

.fl-cmap__row:hover::after {
  transform: scaleY(1);
}

.fl-cmap__row:hover,
.fl-cmap__row.is-done {
  color: var(--on-light);
}

.fl-cmap__row:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.fl-cmap__n {
  flex-shrink: 0;
  width: 1.5em;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--on-light) 40%, transparent);
}

.fl-cmap__row:hover .fl-cmap__n {
  color: var(--on-light);
}

.fl-cmap__author {
  margin-top: 1.25rem;
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--gray);
}

/* desktop sidebar: fixed width, scrolls with a soft fade */
@media (min-width: 1280px) {
  .fl-cmap {
    width: 300px;
  }

  .fl-cmap__list {
    max-height: min(calc(100vh - 320px), 640px);
    overflow: auto;
    padding-bottom: 16px;
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .fl-cmap__row,
  .fl-cmap__n {
    transition: color 0.2s ease;
  }

  .fl-cmap__row::after {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fl-cmap__progress {
    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  }
}
</style>
