<script setup lang="ts">
// Авторы книги. Шапка — как у соседней страницы ladder; дальше во всю ширину реестр авторов:
// место, аватар, имя, полоса вклада (относительно лидера) и число коммитов. Одна строка на автора,
// поэтому страница одинаково держит и одного автора, и сотню. Внизу — три шага, как попасть в список.
import PATHS from "~/const/paths";
import LINKS from "~/const/links";

definePageMeta({
  name: "contributors",
  path: PATHS.contributors,
});

useHead({ title: "Contributors — Frontend Legends" });

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type?: string;
}

const REPO = "frontend-legends/content";
const REPO_URL = `https://github.com/${REPO}`;

// GitHub's anonymous limit: 60 requests an hour per IP. When it runs out, the reset time comes in a header.
const resetAt = ref<number | null>(null);

// The list is built with the site (modules/contributors.ts) and served as /contributors.json, so readers
// never call GitHub. Only if that file is missing does the page ask the GitHub API itself.
const { data, pending, error, refresh } = await useAsyncData("contributors", async () => {
  const built = await $fetch<unknown>("/contributors.json").catch(() => null);
  if (Array.isArray(built)) return built as Contributor[];

  return $fetch<Contributor[]>(`https://api.github.com/repos/${REPO}/contributors?per_page=100`, {
    retry: 0,
    onResponseError({ response }) {
      const reset = Number(response.headers.get("x-ratelimit-reset"));
      resetAt.value = reset ? reset * 1000 : null;
    },
  });
});

const now = useNow({ interval: 15_000 });
const rateLimited = computed(() => [403, 429].includes(error.value?.statusCode ?? 0));
// while the limit holds, «повторить» would only be refused again: the button waits for the reset
const waitMinutes = computed(() =>
  rateLimited.value && resetAt.value ? Math.max(0, Math.ceil((resetAt.value - now.value.getTime()) / 60_000)) : 0,
);

const contributors = computed(() => (data.value || []).filter((c) => !c.type || c.type === "User"));
const top = computed(() => Math.max(1, ...contributors.value.map((c) => c.contributions)));

// GitHub resizes avatars on its side: 2× the 32px cell
const avatar = (url: string) => `${url}${url.includes("?") ? "&" : "?"}s=64`;
const commits = (n: number) => ruPlural(n, "коммит", "коммита", "коммитов");

const STEPS = [
  {
    title: "Найдите, что поправить",
    text: "Опечатку, неточность, устаревший факт или тему, которой в книге не хватает.",
    link: { label: "открытые задачи", href: `${REPO_URL}/issues` },
  },
  {
    title: "Пишите по стандарту",
    text: "У каждой главы одна структура: резюме, рассказ, красные флаги, вопросы с собеседований и практика.",
    link: { label: "стандарт глав", href: `${REPO_URL}/blob/main/CONTENT.md` },
  },
  {
    title: "Откройте pull request",
    text: "После ревью правка выходит на сайт, а вы появляетесь в этом списке.",
    link: { label: "pull requests", href: `${REPO_URL}/pulls` },
  },
];
</script>

<template>
  <div class="fl-cb">
    <!-- header: the same shape as /ladder -->
    <div class="fl-cb__head">
      <div class="fl-cb__titles">
        <h1 class="fl-cb__title">contributors</h1>
        <p class="fl-cb__sub">авторы и редакторы контента</p>
      </div>

      <div class="fl-cb__actions">
        <a :href="REPO_URL" target="_blank" rel="noopener" class="fl-cb__btn is-primary">
          <Icon name="ph:github-logo-bold" aria-hidden="true" />
          <span>github</span>
        </a>
        <a :href="LINKS.telegram" target="_blank" rel="noopener" class="fl-cb__btn">
          <Icon name="ph:telegram-logo-bold" aria-hidden="true" />
          <span>telegram</span>
        </a>
        <a :href="LINKS.email" class="fl-cb__btn">
          <Icon name="ph:envelope-simple-bold" aria-hidden="true" />
          <span>email</span>
        </a>
      </div>
    </div>

    <!-- the register -->
    <div class="fl-cb__table" role="table" aria-label="Авторы" :aria-busy="pending">
      <div class="fl-cb__row fl-cb__row--head" role="row">
        <span role="columnheader">место</span>
        <span role="columnheader">автор</span>
        <span role="columnheader" class="fl-cb__col-share">вклад</span>
        <span role="columnheader" class="fl-cb__col-count">коммиты</span>
      </div>

      <template v-if="pending">
        <div v-for="n in 3" :key="n" class="fl-cb__row fl-cb__row--ghost" aria-hidden="true">
          <span class="fl-cb__rank">{{ String(n).padStart(2, "0") }}</span>
          <span class="fl-cb__who"><span class="fl-cb__avatar" /></span>
          <span class="fl-cb__col-share"><span class="fl-cb__bar" /></span>
          <span />
        </div>
      </template>

      <!-- no data: what happened, what to do; faint empty rows keep the table's shape -->
      <div v-else-if="error" class="fl-cb__empty" role="row">
        <div class="fl-cb__empty-msg" role="cell">
          <span class="fl-cb__empty-icon" aria-hidden="true"><Icon name="ph:cloud-warning-bold" /></span>
          <div class="fl-cb__empty-text">
            <p class="fl-cb__empty-title">Список не загрузился</p>
            <p class="fl-cb__empty-desc">
              <template v-if="rateLimited">
                GitHub ограничивает число запросов с одного адреса.
                {{ waitMinutes ? `Повторить можно через ${waitMinutes} ${ruPlural(waitMinutes, "минуту", "минуты", "минут")}.` : "Попробуйте ещё раз." }}
              </template>
              <template v-else>Не удалось связаться с GitHub. Проверьте соединение и попробуйте ещё раз.</template>
            </p>
          </div>
          <div class="fl-cb__empty-actions">
            <button type="button" class="fl-cb__btn" :disabled="waitMinutes > 0" @click="refresh()">
              <Icon name="ph:arrow-clockwise-bold" aria-hidden="true" />
              <span>повторить</span>
            </button>
            <a :href="`${REPO_URL}/graphs/contributors`" target="_blank" rel="noopener" class="fl-cb__btn">
              <Icon name="ph:github-logo-bold" aria-hidden="true" />
              <span>авторы на github</span>
              <Icon name="ph:arrow-up-right-bold" class="fl-cb__btn-ext" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div v-for="n in 3" :key="n" class="fl-cb__row fl-cb__row--blank" aria-hidden="true">
          <span class="fl-cb__rank">{{ String(n).padStart(2, "0") }}</span>
          <span class="fl-cb__who"><span class="fl-cb__avatar" /><span class="fl-cb__blank-line" /></span>
          <span class="fl-cb__col-share" />
          <span />
        </div>
      </div>

      <template v-else>
        <a
v-for="(c, i) in contributors" :key="c.login" :href="c.html_url" target="_blank" rel="noopener"
          class="fl-cb__row" role="row" :style="{ '--share': c.contributions / top }">
          <span class="fl-cb__rank" role="cell">{{ String(i + 1).padStart(2, "0") }}</span>
          <span class="fl-cb__who" role="cell">
            <img :src="avatar(c.avatar_url)" alt="" width="32" height="32" loading="lazy" class="fl-cb__avatar">
            <span class="fl-cb__name">{{ c.login }}</span>
          </span>
          <span class="fl-cb__col-share" role="cell" aria-hidden="true"><span class="fl-cb__bar" /></span>
          <span class="fl-cb__col-count" role="cell">
            <span class="fl-cb__num">{{ c.contributions }}</span>
            <span class="fl-cb__unit">{{ commits(c.contributions) }}</span>
            <Icon name="ph:arrow-up-right-bold" class="fl-cb__ext" aria-hidden="true" />
          </span>
        </a>

        <!-- the next line is open -->
        <a :href="REPO_URL" target="_blank" rel="noopener" class="fl-cb__row fl-cb__row--next" role="row">
          <span class="fl-cb__rank" role="cell">{{ String(contributors.length + 1).padStart(2, "0") }}</span>
          <span class="fl-cb__who" role="cell">
            <span class="fl-cb__avatar fl-cb__avatar--next" aria-hidden="true"><Icon name="ph:plus-bold" /></span>
            <span class="fl-cb__name">здесь может быть ваше имя</span>
          </span>
          <span class="fl-cb__col-share" role="cell" aria-hidden="true" />
          <span class="fl-cb__col-count" role="cell">
            <span class="fl-cb__unit">первая правка</span>
            <Icon name="ph:arrow-up-right-bold" class="fl-cb__ext" aria-hidden="true" />
          </span>
        </a>
      </template>
    </div>

    <!-- how to get in: a real sequence. Each step is one link; a blurred numeral sits in the corner
         as on chapter slabs. Only the bottom bar moves on hover. -->
    <div class="fl-cb__how">
      <h2 class="fl-cb__h2">Как попасть в список</h2>
      <ol class="fl-cb__steps">
        <li v-for="(s, i) in STEPS" :key="s.title">
          <a :href="s.link.href" target="_blank" rel="noopener" class="fl-cb__step">
            <span class="fl-cb__step-mark" aria-hidden="true">{{ i + 1 }}</span>

            <span class="fl-cb__step-top" aria-hidden="true">
              <span class="fl-cb__step-n">{{ String(i + 1).padStart(2, "0") }}</span>
            </span>

            <span class="fl-cb__step-body">
              <span class="fl-cb__step-title">{{ s.title }}</span>
              <span class="fl-cb__step-text">{{ s.text }}</span>
            </span>

            <span class="fl-cb__step-bar">
              <span>{{ s.link.label }}</span>
              <Icon name="ph:arrow-up-right-bold" aria-hidden="true" />
            </span>
            <span class="sr-only"> (в новой вкладке)</span>
          </a>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
/* layout uses its own classes: Quasar gives `.flex` a `flex-wrap: wrap`, which lets wide rows push the page */
.fl-cb {
  display: grid;
  gap: 3rem;
  min-width: 0;

  font-family: var(--font-sans);
  color: var(--on-light);
}

/* app.css sets `span, p { font-family: var(--font-main) }`: Cyrillic needs Inter */
.fl-cb :deep(span),
.fl-cb p {
  font-family: inherit;
}

/* ---------- header, as /ladder ---------- */
.fl-cb__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.fl-cb__titles {
  display: grid;
  gap: 0.25rem;
}

.fl-cb__title {
  margin: 0;

  font-family: var(--font-main);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 2rem;
}

.fl-cb__sub {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray);
}

.fl-cb__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fl-cb__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 36px;
  padding: 0 0.85rem;
  border: 0;
  border-radius: 0;

  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: var(--on-light);
  background-color: var(--on-semi-dark);
  cursor: pointer;
}

.fl-cb__btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.fl-cb__btn span {
  text-transform: uppercase;
  font-variant: sub;
}

.fl-cb__btn :deep(svg) {
  width: 17px;
  height: 17px;
}

.fl-cb__btn:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--on-light) 16%, var(--on-semi-dark));
}

.fl-cb__btn.is-primary {
  color: #fff;
  background-color: var(--primary);
}

.fl-cb__btn.is-primary:hover {
  background-color: var(--semi-primary);
}

/* ---------- the register ---------- */
.fl-cb__table {
  display: grid;
  min-width: 0;
  border-top: 1px solid var(--semi-gray);
}

/* rank | author | share | commits; below md the share bar drops under the name */
.fl-cb__row {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  grid-template-areas:
    "rank who count"
    ". share share";
  align-items: center;
  column-gap: 1rem;
  row-gap: 0.6rem;
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 8%, transparent);

  font-size: 14px;
  text-decoration: none;
  color: var(--on-light);
}

@media (min-width: 640px) {
  .fl-cb__row {
    grid-template-columns: 3rem minmax(0, 1.2fr) minmax(0, 2fr) 9.5rem;
    grid-template-areas: "rank who share count";
    column-gap: 1.5rem;
  }
}

.fl-cb__row > :nth-child(1) {
  grid-area: rank;
}

.fl-cb__row > :nth-child(2) {
  grid-area: who;
}

.fl-cb__row > .fl-cb__col-share {
  grid-area: share;
}

.fl-cb__row > :nth-child(4) {
  grid-area: count;
}

.fl-cb__row--head {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;

  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--gray);
}

.fl-cb__row--head .fl-cb__col-share {
  display: none;
}

@media (min-width: 640px) {
  .fl-cb__row--head .fl-cb__col-share {
    display: block;
  }
}

/* the site's 3px "this one" bar */
a.fl-cb__row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.85rem;
  bottom: 0.85rem;
  width: 3px;
  background-color: var(--on-light);
  transform: scaleY(0);
}

a.fl-cb__row:hover,
a.fl-cb__row:focus-visible {
  background-color: color-mix(in srgb, var(--on-light) 4%, transparent);
}

a.fl-cb__row:hover::before,
a.fl-cb__row:focus-visible::before {
  transform: scaleY(1);
}

a.fl-cb__row:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.fl-cb .fl-cb__rank {
  font-family: var(--font-main);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-cb__who {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

/* avatars sit in grey with the page and take colour on hover */
.fl-cb__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: cover;

  background-color: var(--on-semi-dark);
  outline: 1px solid var(--semi-gray);
  outline-offset: -1px;
  filter: grayscale(1);
}

a.fl-cb__row:hover .fl-cb__avatar,
a.fl-cb__row:focus-visible .fl-cb__avatar {
  filter: none;
}

.fl-cb .fl-cb__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-family: var(--font-main);
  font-size: 15px;
  font-weight: 600;
}

/* contribution, relative to the top author: a hairline track, a solid bar */
.fl-cb__bar {
  position: relative;
  display: block;
  height: 6px;
  background-color: color-mix(in srgb, var(--on-light) 7%, transparent);
}

.fl-cb__bar::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--on-light) 55%, transparent);
  transform: scaleX(var(--share, 0));
  transform-origin: left;
}

a.fl-cb__row:hover .fl-cb__bar::after {
  background-color: var(--on-light);
}

.fl-cb__col-count {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.35rem;
  white-space: nowrap;
}

.fl-cb .fl-cb__num {
  font-family: var(--font-main);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.fl-cb__unit {
  font-size: 12px;
  color: var(--gray);
}

/* phones: the number alone, so the name gets the room */
@media (max-width: 639.98px) {
  .fl-cb .fl-cb__unit {
    display: none;
  }
}

.fl-cb__ext {
  width: 12px;
  height: 12px;
  margin-left: 0.25rem;
  align-self: center;
  opacity: 0.4;
}

a.fl-cb__row:hover .fl-cb__ext {
  opacity: 1;
}

/* the open line: a step quieter, dashed where a face would be */
.fl-cb__row--next {
  color: var(--gray);
}

.fl-cb__row--next:hover {
  color: var(--on-light);
}

.fl-cb .fl-cb__avatar--next {
  outline: 1px dashed color-mix(in srgb, var(--on-light) 35%, transparent);
  background: transparent;
}

.fl-cb__avatar--next :deep(svg) {
  width: 12px;
  height: 12px;
}

.fl-cb .fl-cb__row--next .fl-cb__name {
  font-family: var(--font-sans);
  font-weight: 400;
}

.fl-cb__row--ghost .fl-cb__avatar,
.fl-cb__row--ghost .fl-cb__bar {
  animation: fl-cb-pulse 1.2s ease-in-out infinite alternate;
}

@keyframes fl-cb-pulse {
  to {
    opacity: 0.35;
  }
}

/* ---------- no data ---------- */
.fl-cb__empty {
  position: relative;
}

.fl-cb__empty-msg {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 1rem 1.25rem;
  padding: 1.75rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 8%, transparent);
}

@media (min-width: 1024px) {
  .fl-cb__empty-msg {
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }
}

.fl-cb__empty-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--semi-gray);
  color: var(--gray);
}

/* iconify draws a 1em span, so the size goes through font-size */
.fl-cb__empty-icon :deep(.iconify) {
  font-size: 20px;
}

.fl-cb__empty-text {
  display: grid;
  gap: 0.3rem;
}

.fl-cb .fl-cb__empty-title {
  margin: 0;

  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.015em;
  color: var(--on-light);
}

.fl-cb .fl-cb__empty-desc {
  max-width: 52ch;
  margin: 0;

  font-size: 14px;
  line-height: 1.55;
  color: var(--gray);
}

.fl-cb__empty-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .fl-cb__empty-actions {
    grid-column: 2;
  }
}

@media (min-width: 1024px) {
  .fl-cb__empty-actions {
    grid-column: 3;
  }
}

.fl-cb__btn-ext {
  width: 12px !important;
  height: 12px !important;
  opacity: 0.6;
}

/* the empty table under the message: frames only, fading out */
.fl-cb__row--blank {
  pointer-events: none;
}

.fl-cb__row--blank:nth-of-type(2) {
  opacity: 0.6;
}

.fl-cb__row--blank:nth-of-type(3) {
  opacity: 0.35;
}

.fl-cb__row--blank:nth-of-type(4) {
  opacity: 0.15;
}

.fl-cb__blank-line {
  display: block;
  width: 7rem;
  height: 8px;
  background-color: color-mix(in srgb, var(--on-light) 8%, transparent);
}

/* ---------- how to get in ---------- */
.fl-cb__h2 {
  margin: 0 0 1rem;

  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.fl-cb__steps {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--semi-gray);
  border-left: 1px solid var(--semi-gray);
}

@media (min-width: 1024px) {
  .fl-cb__steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.fl-cb__steps > li {
  display: flex;
  border-right: 1px solid var(--semi-gray);
  border-bottom: 1px solid var(--semi-gray);
}

.fl-cb__step {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;

  text-decoration: none;
  color: var(--on-light);
}

.fl-cb__step:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

@media (min-width: 1024px) {
  .fl-cb__step {
    min-height: 15rem;
  }
}

/* the blurred numeral, as the watermark on chapter slabs */
.fl-cb .fl-cb__step-mark {
  position: absolute;
  right: 0.75rem;
  bottom: 1.25rem;
  z-index: 0;

  font-family: var(--font-main);
  font-size: 9rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--on-light);
  opacity: 0.06;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.fl-cb__step-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 0;
}

.fl-cb .fl-cb__step-n {
  font-family: var(--font-main);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-cb__step-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 2rem 1.25rem 1.5rem;
}

.fl-cb .fl-cb__step-title {
  max-width: 16ch;

  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.fl-cb .fl-cb__step-text {
  max-width: 34ch;

  font-size: 14px;
  line-height: 1.55;
  color: var(--gray);
}

/* the action: a full-width bar that fills in the page's ink on hover */
.fl-cb__step-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--on-light) 10%, transparent);

  font-size: 13px;
  font-weight: 500;
  background-image: linear-gradient(var(--on-light), var(--on-light));
  background-repeat: no-repeat;
  background-size: 0% 100%;
}

.fl-cb__step-bar :deep(svg) {
  width: 13px;
  height: 13px;
}

.fl-cb__step:hover .fl-cb__step-bar,
.fl-cb__step:focus-visible .fl-cb__step-bar {
  color: var(--on-dark);
  background-size: 100% 100%;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-cb__step-bar {
    transition: background-size 0.45s cubic-bezier(0.65, 0, 0.35, 1), color 0.2s ease 0.1s;
  }
}

.fl-cb .fl-cb__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  a.fl-cb__row::before {
    transition: transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-cb__bar::after {
    animation: fl-cb-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .fl-cb__avatar {
    transition: filter 0.3s ease;
  }
}

/* the bars draw in once, on load */
@keyframes fl-cb-grow {
  from {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fl-cb__row--ghost :is(.fl-cb__avatar, .fl-cb__bar) {
    animation: none;
  }
}
</style>
