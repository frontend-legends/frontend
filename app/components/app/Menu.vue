<script setup lang="ts">
// Меню ниже xl. На странице статьи это её навигатор: плита статьи (номер, глава, прогресс чтения)
// и оглавление, которое знает, где вы сейчас. На остальных страницах — крупные ссылки.
// Внизу всегда ряд ячеек-иконок, как в шапке на десктопе, и главное действие (прочитано / войти).
import PATHS from "~/const/paths";
import LINKS from "~/const/links";
import { useAuthStore } from "~/store/auth.store";
import useScrollPage from "~/composables/usePageProgress";
import type { ContentCollectionItem } from "@nuxt/content";

const { toggleMenu } = useMenu();
const { switchMode, isDark } = useDarkMode();
const { signOut } = useSignOut();
const { scrollProgress } = useScrollPage();

const authStore = useAuthStore();
const isAuth = computed(() => !!authStore.getAuth);

const route = useRoute();
const router = useRouter();

const isStory = computed(() => route.name === "story");

// the open story: the same cache entry AppContent loaded (its key is route.path)
const { data: page } = useNuxtData<ContentCollectionItem | null>(route.path);
const { items, activeIds, isActive } = useStoryToc(page);

const { chapters } = useBookMap();
const chapter = computed(() => chapters.value.find((c) => c.path === `/${route.params.chapter}`));

const order = computed(() => {
  const o = Number(page.value?.order);
  return Number.isFinite(o) && o > 0 ? o.toFixed(2) : null;
});

// h2 are the article's sections, numbered in reading order; h3 hang under them unnumbered
const rows = computed(() => {
  let n = 0;
  return items.value.map((it) => ({ ...it, n: it.depth === 2 ? ++n : null }));
});
const sectionCount = computed(() => rows.value.filter((r) => r.n).length);

// where the reader is: the first section on screen; everything above it is behind
const here = computed(() => items.value.findIndex((it) => it.id === activeIds.value[0]));
const hereSection = computed(() => {
  for (let i = here.value; i >= 0; i--) if (rows.value[i]?.n) return rows.value[i]!.n!;
  return 0;
});

const pct = computed(() => Math.round(Number(scrollProgress.value) || 0));

function decode(hash: string) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

async function go(id: string) {
  toggleMenu(false);
  await nextTick();
  if (decode(route.hash.slice(1)) === id) {
    // same hash: the router would not move, scroll ourselves
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    router.push({ hash: `#${id}` });
  }
}

// open on the reader's place, not at the top of a long outline
const listEl = ref<HTMLElement | null>(null);
onMounted(() => {
  nextTick(() =>
    requestAnimationFrame(() => {
      const list = listEl.value;
      const cur = list?.querySelector<HTMLElement>(".is-here");
      if (list && cur) list.scrollTop = Math.max(0, cur.offsetTop - list.clientHeight * 0.3);
    }),
  );
});

// any navigation closes the menu (also links outside it: «войти» in AppFinish, the logo)
watch(() => route.path, () => toggleMenu(false));

// grown past xl (rotate, resize): the desktop header takes over
const isDesktop = useMediaQuery("(min-width: 1280px)");
watch(isDesktop, (v) => v && toggleMenu(false));

useEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") toggleMenu(false);
});

async function signOutFn() {
  signOut();
  toggleMenu(false);
  await navigateTo({ path: PATHS.home });
}

const pages = [
  { name: "home", label: "home", to: PATHS.home },
  { name: "ladder", label: "ladder", to: PATHS.ladder },
  { name: "contributors", label: "contributors", to: PATHS.contributors },
];
</script>

<template>
  <div id="app-menu" class="fl-menu xl:hidden" role="dialog" aria-modal="true" aria-label="Меню">
    <div class="fl-menu__frame">
      <!-- ───── story: the article as a slab + its outline ───── -->
      <template v-if="isStory && page">
        <div class="fl-menu__story fl-slab bg-on-light text-on-dark">
          <span v-if="order" class="fl-menu__mark" aria-hidden="true">{{ order }}</span>

          <!-- the percentage itself is in the header; the slab only carries the bar -->
          <div class="fl-menu__story-top">
            <NuxtLink v-if="chapter" :to="`/content${chapter.path}`" class="fl-menu__chapter">
              <Icon name="ph:arrow-left-bold" aria-hidden="true" />
              <span>{{ chapter.title.toLowerCase() }}</span>
            </NuxtLink>
          </div>

          <p class="fl-menu__title">{{ page.title }}</p>

          <span class="fl-menu__progress" :style="{ transform: `scaleX(${pct / 100})` }" aria-hidden="true" />
        </div>

        <nav v-if="rows.length" class="fl-menu__toc" aria-label="Содержание статьи">
          <div class="fl-menu__toc-head">
            <span>Содержание</span>
            <span v-if="hereSection" class="fl-menu__count">{{ hereSection }} / {{ sectionCount }}</span>
          </div>

          <ol ref="listEl" class="fl-menu__list">
            <li v-for="(row, i) in rows" :key="row.id" :style="{ '--i': Math.min(i, 14) }">
              <a :href="`#${row.id}`" class="fl-menu__item" :class="[
                `fl-menu__item--d${row.depth}`,
                { 'is-here': isActive(row.id), 'is-read': here >= 0 && i < here },
              ]" :aria-current="activeIds[0] === row.id ? 'location' : undefined" @click.prevent="go(row.id)">
                <span v-if="row.n" class="fl-menu__n">{{ String(row.n).padStart(2, "0") }}</span>
                <span class="fl-menu__text">{{ row.text }}</span>
              </a>
            </li>
          </ol>
        </nav>
      </template>

      <!-- ───── elsewhere: the site's pages, in big type ───── -->
      <nav v-else class="fl-menu__pages" aria-label="Разделы сайта">
        <NuxtLink v-for="(p, i) in pages" :key="p.name" :to="p.to" class="fl-menu__page"
          :class="{ 'is-current': route.name === p.name }" :style="{ '--i': i }"
          :aria-current="route.name === p.name ? 'page' : undefined">
          {{ p.label }}
        </NuxtLink>
      </nav>

      <!-- ───── utility cells: the desktop header's icons ───── -->
      <div class="fl-menu__cells">
        <template v-if="isStory">
          <NuxtLink v-for="p in pages" :key="p.name" :to="p.to" class="fl-menu__cell" :aria-label="p.label">
            <Icon :name="p.name === 'home' ? 'ph:house-bold' : p.name === 'ladder' ? 'ph:ranking-bold' : 'ph:users-three-bold'" />
          </NuxtLink>
        </template>
        <button type="button" class="fl-menu__cell" :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'" @click="switchMode">
          <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />
        </button>
        <a :href="LINKS.telegram" target="_blank" rel="noopener" class="fl-menu__cell" aria-label="Telegram">
          <Icon name="ph:telegram-logo-bold" />
        </a>
        <a :href="LINKS.github" target="_blank" rel="noopener" class="fl-menu__cell" aria-label="GitHub">
          <Icon name="ph:github-logo-bold" />
        </a>
        <button v-if="isAuth" type="button" class="fl-menu__cell" aria-label="Выйти" @click="signOutFn">
          <Icon name="ph:sign-out-bold" />
        </button>
      </div>

      <!-- ───── the one action ───── -->
      <AppFinish v-if="isStory" class="fl-menu__action" />
      <NuxtLink v-else-if="!isAuth" :to="PATHS.signin" class="fl-menu__action fl-menu__signin">
        <span>sign in</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* app.css sets `span, p { font-family: var(--font-main) }`; inside the menu every span inherits its block */
.fl-menu :deep(:is(span, p)) {
  font-family: inherit;
}

/* full screen under the header, above the fixed footer strip (20px) */
.fl-menu {
  position: fixed;
  top: 52px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;

  background-color: var(--on-dark);
}

/* the header's frame continues down: same hairlines left and right, same max width */
.fl-menu__frame {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 1.25rem 1.25rem calc(20px + 1.25rem);
}

/* ---------- story slab ---------- */
.fl-menu__story {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.75rem;
  padding: 1rem 1.25rem 1.25rem;
}

/* oversized blurred number, as on the article header and «дальше» */
.fl-menu__mark {
  position: absolute;
  right: -0.5rem;
  bottom: -2.25rem;

  font-family: var(--font-main) !important;
  font-size: 112px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  white-space: nowrap;
  opacity: 0.08;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.fl-menu__story-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.fl-menu__chapter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;

  font-family: var(--font-main);
  font-size: 12px;
  text-decoration: none;
  color: inherit;
  opacity: 0.7;
}

.fl-menu__chapter:hover {
  opacity: 1;
}

.fl-menu__chapter :deep(svg) {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.fl-menu__title {
  position: relative;
  margin: 0;

  font-family: var(--font-main);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* reading progress: the slab's bottom edge fills left → right */
.fl-menu__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;

  background-color: currentColor;
  transform-origin: left;
}

/* ---------- outline ---------- */
.fl-menu__toc {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.fl-menu__toc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--semi-gray);

  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--gray);
}

.fl-menu__count {
  font-family: var(--font-main);
  font-variant-numeric: tabular-nums;
  color: var(--on-light);
}

.fl-menu__list {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0 1.5rem;

  /* links dissolve at the edges instead of being sliced */
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 12px, #000 calc(100% - 28px), transparent);
}

.fl-menu__item {
  position: relative;
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: baseline;
  padding: 0.55rem 0 0.55rem 0.9rem;

  font-family: var(--font-sans);
  text-decoration: none;
  color: var(--gray);
}

/* the "you are here" bar: the header's 3px active bar, stood upright */
.fl-menu__item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55rem;
  bottom: 0.55rem;
  width: 3px;
  background-color: var(--on-light);
  transform: scaleY(0);
}

.fl-menu__item--d2 {
  font-size: 1rem;
  line-height: 1.35;
}

.fl-menu__item--d3 {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
  font-size: 0.875rem;
  line-height: 1.35;
}

.fl-menu__item--d3 .fl-menu__text {
  grid-column: 2;
}

.fl-menu__n {
  font-family: var(--font-main) !important;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}

/* behind the reader: dimmer than what is still ahead */
.fl-menu__item.is-read {
  color: color-mix(in srgb, var(--gray) 55%, transparent);
}

.fl-menu__item.is-here {
  color: var(--on-light);
}

.fl-menu__item.is-here::before {
  transform: scaleY(1);
}

.fl-menu__item.is-here .fl-menu__n {
  opacity: 1;
}

.fl-menu__item:hover {
  color: var(--on-light);
}

/* ---------- site pages (not a story) ---------- */
/* sits on the cells, under the thumb; the space above stays empty */
.fl-menu__pages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  min-height: 0;
}

.fl-menu__page:first-child {
  border-top: 1px solid var(--semi-gray);
}

.fl-menu__page {
  position: relative;
  padding: 0.9rem 0 0.9rem 1rem;
  border-bottom: 1px solid var(--semi-gray);

  font-family: var(--font-main);
  font-size: clamp(2rem, 9vw, 2.75rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  text-decoration: none;
  color: var(--gray);
}

.fl-menu__page::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.9rem;
  bottom: 0.9rem;
  width: 3px;
  background-color: var(--on-light);
  transform: scaleY(0);
}

.fl-menu__page:hover,
.fl-menu__page.is-current {
  color: var(--on-light);
}

.fl-menu__page.is-current::before {
  transform: scaleY(1);
}

/* ---------- cells ---------- */
.fl-menu__cells {
  flex-shrink: 0;
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  border: 1px solid var(--semi-gray);
}

.fl-menu__cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0;
  border: 0;
  border-left: 1px solid var(--semi-gray);

  background: transparent;
  color: var(--on-light);
  opacity: 0.8;
  text-decoration: none;
  cursor: pointer;
}

.fl-menu__cell:first-child {
  border-left: 0;
}

.fl-menu__cell :deep(svg) {
  width: 18px;
  height: 18px;
}

/* the header's bar: grows left → right under the cell */
.fl-menu__cell::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background-color: var(--on-semi-dark);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-menu__cell:hover {
  opacity: 1;
}

.fl-menu__cell:hover::after {
  transform: scaleX(1);
}

/* ---------- action ---------- */
.fl-menu__action {
  flex-shrink: 0;
}

.fl-menu__signin {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;

  font-family: var(--font-main);
  font-size: 14px;
  text-transform: uppercase;
  font-variant: sub;
  text-decoration: none;
  color: #fff;
  background-color: var(--primary);
}

.fl-menu__signin:hover {
  opacity: 0.9;
}

.fl-menu a:focus-visible,
.fl-menu button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

/* ---------- motion: one cascade when the menu opens ---------- */
@media (prefers-reduced-motion: no-preference) {
  .fl-menu__list > li,
  .fl-menu__page {
    animation: fl-menu-in 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(60ms + var(--i, 0) * 22ms);
  }

  .fl-menu__progress {
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-menu__item::before,
  .fl-menu__page::before {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-menu__cell::after {
    transition: transform 0.3s ease;
  }
}

@keyframes fl-menu-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
