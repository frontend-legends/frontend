<script setup lang="ts">
// Ladder — одна таблица в языке /contributors, вкладки в шапке:
//  — monthly / all time: рейтинг; полоса — какая часть книги пройдена (за месяц / всего);
//  — legends: кто прошёл книгу целиком, по порядку; место навсегда (звание не снимается,
//    когда в книге появляются новые темы). Легенды носят чип LEGEND и в остальных вкладках.
// Пустое место — строка с пунктирным квадратом, как «здесь может быть ваше имя» на /contributors.
import { useQuery } from "@vue/apollo-composable";
import { usersGql } from "~/api/app";
import { useAuthStore } from "~/store/auth.store";
import PATHS from "~/const/paths";

definePageMeta({
  name: "ladder",
  path: PATHS.ladder,
});

useHead({ title: "Ladder — Frontend Legends" });

const authStore = useAuthStore();
const meId = computed(() => authStore.getUserId);
const { isAuth, totalStories, totalDone, nextStory } = useBookMap();

interface PublicUser {
  id: string;
  name: string | null;
}
interface Entry {
  rank: number;
  user: PublicUser;
  stories_finished: number;
}
interface Legend {
  rank: number;
  user: PublicUser;
  legend_at: string;
  legend_total: number;
}
type Tab = "month" | "all" | "legends";
const tab = ref<Tab>("month");

const now = useNow({ interval: 60_000 });
const today = computed(() => new Date(now.value));
const monthName = computed(() => today.value.toLocaleDateString("ru-RU", { month: "long" }));
const monthlyVars = computed(() => ({
  year: today.value.getFullYear(),
  month: today.value.getMonth() + 1,
  limit: 100,
}));

const { result: monthlyRes, loading: monthlyLoading } = useQuery(usersGql.MONTHLY_LEADERBOARD, monthlyVars);
const { result: globalRes, loading: globalLoading } = useQuery(usersGql.GLOBAL_LEADERBOARD, { limit: 100 });
// an API without this query yet (backend not deployed) → the tab hides instead of claiming "nobody"
const { result: hallRes, loading: hallLoading, error: hallError } = useQuery(usersGql.HALL_OF_LEGENDS);
const legends = computed<Legend[]>(() => hallRes.value?.hall_of_legends?.legends || []);
const meLegend = computed(() => legends.value.some((l) => l.user.id === meId.value));
const legendRank = computed(() => new Map(legends.value.map((l) => [l.user.id, l.rank])));
// the hovered or focused row: its LEGEND chip lights up
const hot = ref<string | null>(null);

const tabs = computed(() =>
  [
    { id: "month" as const, label: "monthly", count: null },
    { id: "all" as const, label: "all time", count: null },
    { id: "legends" as const, label: "legends", count: legends.value.length || null, hidden: !!hallError.value },
  ].filter((t) => !t.hidden),
);
watchEffect(() => {
  if (!tabs.value.some((t) => t.id === tab.value)) tab.value = "month";
});

const monthly = computed<Entry[]>(() => monthlyRes.value?.monthly_leaderboard || []);
const entries = computed<Entry[]>(() => (tab.value === "all" ? globalRes.value?.global_leaderboard || [] : monthly.value));
const loading = computed(
  () =>
    ({
      month: monthlyLoading.value,
      all: globalLoading.value,
      legends: hallLoading.value,
    })[tab.value],
);

// the book's size as the API counts it (the marks come from there too), else the book map's
const bookTotal = computed(() => hallRes.value?.hall_of_legends?.total_stories || totalStories.value || 1);
const share = (n: number) => Math.min(1, n / bookTotal.value);
const pct = (n: number) => {
  const v = share(n) * 100;
  return v > 0 && v < 1 ? "<1%" : `${Math.round(v)}%`;
};

const caption = computed(
  () =>
    ({
      month: `За ${monthName.value}`,
      all: "За всё время",
      legends: "Hall of Legends",
    })[tab.value],
);
const hint = computed(
  () =>
    ({
      month: "темы, отмеченные в этом месяце, и какая это часть книги",
      all: "все отмеченные темы и какая часть книги пройдена",
      legends: "прошли всю книгу — место остаётся навсегда",
    })[tab.value],
);
const midHead = computed(() => (tab.value === "legends" ? "прошёл книгу" : tab.value === "month" ? "за месяц от книги" : "пройдено от книги"));

const p2 = (n: number) => String(n).padStart(2, "0");
const topics = (n: number) => ruPlural(n, "тема", "темы", "тем");
const left = computed(() => Math.max(0, totalStories.value - totalDone.value));
const nextTo = computed(() => (isAuth.value ? (nextStory.value ? `/content${nextStory.value.path}` : PATHS.home) : PATHS.signin));

function initials(name: string | null) {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0]) // first letter, skipping "(", quotes and the like
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
</script>

<template>
  <div class="fl-ld">
    <!-- header: the same shape as /contributors; the tabs pick what the one table shows -->
    <div class="fl-ld__head">
      <div class="fl-ld__titles">
        <h1 class="fl-ld__title">ladder</h1>
        <p class="fl-ld__sub">рейтинг по завершённым темам</p>
      </div>
      <div class="fl-ld__actions" role="group" aria-label="Что показать">
        <button
v-for="t in tabs" :key="t.id" type="button" class="fl-ld__btn" :class="{ 'is-primary': tab === t.id }"
          :aria-pressed="tab === t.id" @click="tab = t.id">
          <span>{{ t.label }}</span>
          <span v-if="t.count" class="fl-ld__btn-count">{{ t.count }}</span>
        </button>
      </div>
    </div>

    <div class="fl-ld__part">
      <div class="fl-ld__part-head">
        <h2 class="fl-ld__h2">{{ caption }}</h2>
        <p class="fl-ld__hint">{{ hint }}</p>
      </div>

      <div class="fl-ld__table" role="table" :aria-label="caption" :aria-busy="loading">
        <!-- ───── rank | user | middle | topics ───── -->
        <div class="fl-ld__row fl-ld__row--head" role="row">
          <span role="columnheader">место</span>
          <span role="columnheader">пользователь</span>
          <span role="columnheader" class="fl-ld__col-mid">{{ midHead }}</span>
          <span role="columnheader" class="fl-ld__col-end">темы</span>
        </div>

        <template v-if="loading">
          <div v-for="n in 3" :key="n" class="fl-ld__row fl-ld__row--ghost" aria-hidden="true">
            <span class="fl-ld__rank">{{ p2(n) }}</span>
            <span class="fl-ld__who"><span class="fl-ld__avatar" /></span>
            <span class="fl-ld__col-mid"><span class="fl-ld__bar" /></span>
            <span />
          </div>
        </template>

        <!-- legends -->
        <template v-else-if="tab === 'legends'">
          <div
v-for="l in legends" :key="l.user.id" class="fl-ld__row" :class="{ 'is-me': l.user.id === meId }"
            role="row" @mouseenter="hot = l.user.id" @mouseleave="hot = null">
            <span class="fl-ld__rank" role="cell">{{ p2(l.rank) }}</span>
            <span class="fl-ld__who" role="cell">
              <span class="fl-ld__avatar" aria-hidden="true">{{ initials(l.user.name) }}</span>
              <span class="fl-ld__name">{{ l.user.name || "anon" }}</span>
              <span v-if="l.user.id === meId" class="fl-ld__you">вы</span>
              <AppLegendChip :seed="l.user.id" :num="l.rank" :active="hot === l.user.id" />
            </span>
            <span class="fl-ld__col-mid fl-ld__muted" role="cell">{{ formatRuDate(l.legend_at) }}</span>
            <span class="fl-ld__col-end" role="cell">
              <span class="fl-ld__num">{{ l.legend_total }}</span>
              <span class="fl-ld__unit">{{ topics(l.legend_total) }}</span>
            </span>
          </div>

          <!-- the next place in the hall: the reader's own way to it -->
          <NuxtLink v-if="!meLegend" :to="nextTo" class="fl-ld__row fl-ld__row--next" role="row">
            <span class="fl-ld__rank" role="cell">{{ p2(legends.length + 1) }}</span>
            <span class="fl-ld__who" role="cell">
              <span class="fl-ld__avatar fl-ld__avatar--next" aria-hidden="true"><Icon name="ph:plus-bold" /></span>
              <span class="fl-ld__name">{{ legends.length ? "здесь может быть ваше имя" : "первое место свободно" }}</span>
            </span>
            <span class="fl-ld__col-mid fl-ld__muted" role="cell">
              {{ isAuth ? `вы прошли ${totalDone} из ${totalStories}` : "войдите и отмечайте темы" }}
            </span>
            <span class="fl-ld__col-end" role="cell">
              <span class="fl-ld__unit">{{ isAuth ? `осталось ${left}` : `все ${totalStories} ${topics(totalStories)}` }}</span>
              <Icon name="ph:arrow-right-bold" class="fl-ld__go" aria-hidden="true" />
            </span>
          </NuxtLink>
        </template>

        <!-- rating: the bar is the part of the book done (this month / in all) -->
        <template v-else>
          <div
v-for="e in entries" :key="e.user.id" class="fl-ld__row" :class="{ 'is-me': e.user.id === meId }"
            role="row" :style="{ '--share': share(e.stories_finished) }" @mouseenter="hot = e.user.id"
            @mouseleave="hot = null">
            <span class="fl-ld__rank" role="cell">{{ p2(e.rank) }}</span>
            <span class="fl-ld__who" role="cell">
              <span class="fl-ld__avatar" aria-hidden="true">{{ initials(e.user.name) }}</span>
              <span class="fl-ld__name">{{ e.user.name || "anon" }}</span>
              <span v-if="e.user.id === meId" class="fl-ld__you">вы</span>
              <AppLegendChip
v-if="legendRank.has(e.user.id)" :seed="e.user.id" :num="legendRank.get(e.user.id)"
                :active="hot === e.user.id" />
            </span>
            <span class="fl-ld__col-mid fl-ld__share" role="cell">
              <span class="fl-ld__bar" aria-hidden="true" />
              <span class="fl-ld__pct">{{ pct(e.stories_finished) }}</span>
            </span>
            <span class="fl-ld__col-end" role="cell">
              <span class="fl-ld__num">{{ e.stories_finished }}</span>
              <span class="fl-ld__unit">{{ topics(e.stories_finished) }}</span>
            </span>
          </div>

          <!-- nobody yet, or the reader is not on the list: the open line -->
          <NuxtLink
v-if="!entries.some((e) => e.user.id === meId)" :to="nextTo" class="fl-ld__row fl-ld__row--next"
            role="row">
            <span class="fl-ld__rank" role="cell">{{ p2(entries.length + 1) }}</span>
            <span class="fl-ld__who" role="cell">
              <span class="fl-ld__avatar fl-ld__avatar--next" aria-hidden="true"><Icon name="ph:plus-bold" /></span>
              <span class="fl-ld__name">{{ entries.length ? "здесь может быть ваше имя" : "пока никого — станьте первым" }}</span>
            </span>
            <span class="fl-ld__col-mid" role="cell" aria-hidden="true" />
            <span class="fl-ld__col-end" role="cell">
              <span class="fl-ld__unit">{{ isAuth ? "отметить тему" : "войти" }}</span>
              <Icon name="ph:arrow-right-bold" class="fl-ld__go" aria-hidden="true" />
            </span>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* own layout classes and <div>s: Quasar gives `.flex` a `flex-wrap: wrap`, app.css centres every <section> */
.fl-ld {
  display: grid;
  gap: 3.5rem;
  min-width: 0;

  font-family: var(--font-sans);
  color: var(--on-light);
}

/* app.css sets `span, p { font-family: var(--font-main) }`: Cyrillic needs Inter */
.fl-ld :deep(span),
.fl-ld p {
  font-family: inherit;
}

/* ---------- header, as /contributors ---------- */
.fl-ld__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: -0.5rem;
}

.fl-ld__titles {
  display: grid;
  gap: 0.25rem;
}

.fl-ld__title {
  margin: 0;

  font-family: var(--font-main);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 2rem;
}

.fl-ld__sub {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray);
}

.fl-ld__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* phones: the four tabs in a 2 × 2 grid across the width */
@media (max-width: 639.98px) {
  .fl-ld__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .fl-ld__actions .fl-ld__btn {
    justify-content: center;
  }
}

.fl-ld__btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 0.85rem;
  border: 0;
  border-radius: 0;

  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--on-light);
  background-color: var(--on-semi-dark);
  cursor: pointer;
}

.fl-ld .fl-ld__btn span {
  text-transform: uppercase;
  font-variant: sub;
}

.fl-ld__btn:hover {
  background-color: color-mix(in srgb, var(--on-light) 16%, var(--on-semi-dark));
}

.fl-ld .fl-ld__btn-count {
  margin-left: 0.45rem;
  padding: 0 5px;

  font-family: var(--font-main);
  font-size: 11px;
  font-weight: 700;
  text-transform: none;
  font-variant: normal;
  line-height: 16px;
  background-color: color-mix(in srgb, currentColor 16%, transparent);
}

.fl-ld__btn.is-primary {
  color: #fff;
  background-color: var(--primary);
}

.fl-ld__btn.is-primary:hover {
  background-color: var(--semi-primary);
}

.fl-ld__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

/* ---------- sections ---------- */
.fl-ld__part {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.fl-ld__part-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25rem 1.5rem;
}

.fl-ld__h2 {
  margin: 0;

  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.fl-ld__hint {
  margin: 0;
  font-size: 12px;
  color: var(--gray);
}

/* ---------- the tables, as /contributors ---------- */
.fl-ld__table {
  display: grid;
  min-width: 0;
  border-top: 1px solid var(--semi-gray);
}

/* rank | user | middle (bar or date) | count; below md the middle drops under the name */
.fl-ld__row {
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  grid-template-areas:
    "rank who end"
    ". mid mid";
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
  .fl-ld__row {
    grid-template-columns: 3rem minmax(0, 1.2fr) minmax(0, 2fr) 9.5rem;
    grid-template-areas: "rank who mid end";
    column-gap: 1.5rem;
  }
}

.fl-ld__row > :nth-child(1) {
  grid-area: rank;
}

.fl-ld__row > :nth-child(2) {
  grid-area: who;
}

.fl-ld__row > .fl-ld__col-mid {
  grid-area: mid;
}

.fl-ld__row > :nth-child(4) {
  grid-area: end;
}

.fl-ld__row--head {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;

  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--gray);
}

.fl-ld__row--head .fl-ld__col-mid {
  display: none;
}

@media (min-width: 640px) {
  .fl-ld__row--head .fl-ld__col-mid {
    display: block;
  }
}

.fl-ld__col-end {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.35rem;
  white-space: nowrap;
}

/* you: a blue tint and the 3px bar */
.fl-ld__row.is-me {
  background-color: color-mix(in srgb, var(--primary) 10%, transparent);
}

.fl-ld__row.is-me::before,
a.fl-ld__row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.85rem;
  bottom: 0.85rem;
  width: 3px;
  background-color: var(--primary);
}

a.fl-ld__row::before {
  background-color: var(--on-light);
  transform: scaleY(0);
}

a.fl-ld__row:hover {
  background-color: color-mix(in srgb, var(--on-light) 4%, transparent);
}

a.fl-ld__row:hover::before {
  transform: scaleY(1);
}

a.fl-ld__row:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.fl-ld .fl-ld__rank {
  font-family: var(--font-main);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-ld__who {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.fl-ld .fl-ld__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;

  font-size: 11px;
  font-weight: 700;
  color: var(--on-dark);
  background-color: var(--on-light);
}

/* the open place: dashed where a face would be */
.fl-ld .fl-ld__avatar--next {
  color: var(--gray);
  background: transparent;
  outline: 1px dashed color-mix(in srgb, var(--on-light) 35%, transparent);
  outline-offset: -1px;
}

.fl-ld__avatar--next :deep(.iconify) {
  font-size: 12px;
}

.fl-ld .fl-ld__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-family: var(--font-main);
  font-size: 15px;
  font-weight: 600;
}

.fl-ld .fl-ld__you {
  flex-shrink: 0;
  padding: 1px 5px;

  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
  background-color: var(--primary);
}

.fl-ld .fl-ld__muted {
  font-size: 13px;
  color: var(--gray);
}

.fl-ld .fl-ld__num {
  font-family: var(--font-main);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.fl-ld .fl-ld__unit {
  font-size: 12px;
  color: var(--gray);
}

.fl-ld__go {
  width: 13px;
  height: 13px;
  margin-left: 0.25rem;
  align-self: center;
  opacity: 0.45;
}

a.fl-ld__row:hover .fl-ld__go {
  opacity: 1;
}

/* the open line: everything a step quieter */
.fl-ld__row--next {
  color: var(--gray);
}

.fl-ld .fl-ld__row--next .fl-ld__name {
  font-family: var(--font-sans);
  font-weight: 400;
  color: var(--gray);
}

.fl-ld .fl-ld__row--next:hover .fl-ld__name {
  color: var(--on-light);
}

/* the part of the book: a track, a solid bar and the percentage */
.fl-ld__share {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.fl-ld__share .fl-ld__bar {
  flex: 1;
}

.fl-ld .fl-ld__pct {
  width: 2.75rem;
  flex-shrink: 0;

  font-family: var(--font-main);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--gray);
}

.fl-ld__bar {
  position: relative;
  display: block;
  height: 6px;
  background-color: color-mix(in srgb, var(--on-light) 7%, transparent);
}

.fl-ld__bar::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--on-light) 55%, transparent);
  transform: scaleX(var(--share, 0));
  transform-origin: left;
}

.fl-ld__row.is-me .fl-ld__bar::after {
  background-color: var(--primary);
}

.fl-ld__row--ghost :is(.fl-ld__avatar, .fl-ld__bar) {
  background-color: var(--on-semi-dark);
  animation: fl-ld-pulse 1.2s ease-in-out infinite alternate;
}

@keyframes fl-ld-pulse {
  to {
    opacity: 0.35;
  }
}

/* phones: the number alone, so the name gets the room */
@media (max-width: 639.98px) {
  .fl-ld .fl-ld__unit {
    display: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  a.fl-ld__row::before {
    transition: transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-ld__bar::after {
    animation: fl-ld-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
}

/* bars draw in once, on load */
@keyframes fl-ld-grow {
  from {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fl-ld__row--ghost :is(.fl-ld__avatar, .fl-ld__bar) {
    animation: none;
  }
}
</style>
