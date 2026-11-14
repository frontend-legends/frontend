<script setup lang="ts">
// Карта книги = оглавление. Тот же вид (две колонки: главы и темы), но в языке книжного оглавления:
// крупный номер главы, отточие от названия до даты; при наведении по отточию пробегает сплошная линия.
// Если пользователь вошёл — квадрат-отметка у пройденных тем и прогресс главы на линии под шапкой.
const { isAuth, chapters, totalStories, totalDone, isCompleted } = useBookMap();

const storyNum = (order: number) => pad2(Math.round((Number(order) % 1) * 100));

const FRESH_DAYS = 30;
const now = Date.now();
function fmtDate(d?: string) {
  if (!d) return "";
  const t = new Date(d);
  return `${pad2(t.getDate())}.${pad2(t.getMonth() + 1)}.${String(t.getFullYear()).slice(2)}`;
}
const isFresh = (d?: string) => !!d && now - new Date(d).getTime() < FRESH_DAYS * 864e5;
const plural = ruPlural;
const pad = pad2;
</script>

<template>
  <section class="fl-map" aria-labelledby="map-title">
    <div class="fl-map__top">
      <h2 id="map-title" class="fl-map__heading">карта книги</h2>
      <span class="fl-map__totals">
        <template v-if="isAuth">пройдено {{ totalDone }} из {{ totalStories }}</template>
        <template v-else>{{ chapters.length }} {{ plural(chapters.length, "глава", "главы", "глав") }},
          {{ totalStories }} {{ plural(totalStories, "тема", "темы", "тем") }}</template>
      </span>
    </div>

    <div class="fl-map__cols">
      <article v-for="ch in chapters" :key="ch.order" class="fl-map__chapter">
        <NuxtLink :to="`/content${ch.path}`" class="fl-map__head">
          <span class="fl-map__num">{{ pad(ch.order) }}</span>
          <span class="fl-map__title">{{ ch.title }}</span>
          <span class="fl-map__meta">
            <template v-if="isAuth">{{ ch.done }} / {{ ch.children.length }}</template>
            <template v-else>{{ ch.children.length }} {{ plural(ch.children.length, "тема", "темы", "тем") }}</template>
          </span>
          <!-- latest update in the chapter; sits in the same column as the story dates below -->
          <time v-if="ch.date" class="fl-map__hdate" :class="{ 'is-fresh': isFresh(ch.date) }" :datetime="ch.date"
            :aria-label="`глава обновлена ${fmtDate(ch.date)}`">{{ fmtDate(ch.date) }}</time>
          <!-- chapter progress fills the hairline under the head -->
          <span v-if="isAuth" class="fl-map__progress" :style="{ '--pct': ch.pct }" aria-hidden="true" />
        </NuxtLink>

        <ol class="fl-map__list">
          <li v-for="s in ch.children" :key="s.id">
            <NuxtLink :to="`/content${s.path}`" class="fl-map__row"
              :class="{ 'is-done': isCompleted(s.path), 'is-fresh': isFresh(s.date) }">
              <span v-if="isAuth" class="fl-map__mark" :aria-label="isCompleted(s.path) ? 'пройдено' : undefined" />
              <span class="fl-map__n">{{ storyNum(s.order) }}</span>
              <span class="fl-map__t">{{ s.title.toLowerCase() }}</span>
              <span class="fl-map__leader" aria-hidden="true" />
              <time v-if="s.date" class="fl-map__d" :datetime="s.date">{{ fmtDate(s.date) }}</time>
            </NuxtLink>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>

<style scoped>
.fl-map {
  margin: 3rem 0 4rem;
  padding: 0;
}

/* ---------- top line ---------- */
.fl-map__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 3rem;
}

.fl-map__heading {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--gray);
}

.fl-map__totals {
  font-family: var(--font-sans);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

/* ---------- columns: book-style flow, no gaps between short and long chapters ---------- */
.fl-map__cols {
  columns: 1;
}

.fl-map__chapter {
  break-inside: avoid;
  padding-bottom: 3.5rem;
}

/* ---------- chapter head ---------- */
.fl-map__head {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 22%, transparent);

  text-decoration: none;
  color: var(--on-light);
}

.fl-map__num {
  font-family: var(--font-main);
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  opacity: 0.35;
}

.fl-map__head:hover .fl-map__num {
  opacity: 1;
}

.fl-map .fl-map__title {
  min-width: 0;

  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fl-map__meta {
  margin-left: auto;
  white-space: nowrap;

  font-family: var(--font-main);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-map__hdate {
  flex-shrink: 0;
  min-width: 4.6em;
  text-align: right;
  white-space: nowrap;

  font-family: var(--font-main);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--on-light) 38%, transparent);
}

.fl-map__hdate.is-fresh,
.fl-map__head:hover .fl-map__hdate {
  color: var(--on-light);
}

/* hover: a solid line sweeps over the head's hairline, left → right (same gesture as the rows) */
.fl-map__head::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: var(--on-light);
  transform: scaleX(0);
  transform-origin: left;
  pointer-events: none;
}

.fl-map__head:hover::after {
  transform: scaleX(1);
}

.fl-map__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: var(--on-light);
  transform: scaleX(var(--pct, 0));
  transform-origin: left;
}

/* ---------- rows ---------- */
.fl-map__list {
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.fl-map__row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.3rem 0;

  font-family: var(--font-main);
  font-size: 15px;
  line-height: 1.35;
  text-decoration: none;
  color: color-mix(in srgb, var(--on-light) 78%, transparent);
}

.fl-map__row:hover {
  color: var(--on-light);
}

.fl-map__row:focus-visible,
.fl-map__head:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

/* progress square, same 7px mark as ::practice / ::pitfall */
.fl-map__mark {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border: 1px solid color-mix(in srgb, var(--on-light) 30%, transparent);
  transform: translateY(-0.1em);
}

.is-done .fl-map__mark {
  border-color: var(--on-light);
  background-color: var(--on-light);
}

.fl-map__n {
  flex-shrink: 0;
  width: 1.6em;

  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-map__row:hover .fl-map__n {
  color: var(--on-light);
}

.fl-map__t {
  min-width: 0;
}

/* отточие: dotted leader from the title to the date; a solid line sweeps over it on hover */
.fl-map__leader {
  position: relative;
  flex: 1;
  min-width: 1.5rem;
  height: 1px;
  align-self: flex-end;
  margin-bottom: 0.55em;

  background-image: linear-gradient(to right, color-mix(in srgb, var(--on-light) 28%, transparent) 1px, transparent 1px);
  background-size: 4px 1px;
  background-repeat: repeat-x;
}

.fl-map__leader::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--on-light);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-map__row:hover .fl-map__leader::after {
  transform: scaleX(1);
}

/* date: muted, fresh (≤ 30 days) at full contrast, brightens with the row */
.fl-map__d {
  flex-shrink: 0;
  min-width: 4.6em;
  text-align: right;

  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--on-light) 38%, transparent);
}

.is-fresh .fl-map__d,
.fl-map__row:hover .fl-map__d {
  color: var(--on-light);
}

@media (min-width: 900px) {
  .fl-map__cols {
    columns: 2;
    column-gap: 6rem;
    column-rule: 1px solid var(--semi-gray);
  }
}

@media (max-width: 480px) {
  .fl-map__d,
  .fl-map__hdate {
    display: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .fl-map__row,
  .fl-map__n,
  .fl-map__num,
  .fl-map__d {
    transition: color 0.2s ease, opacity 0.2s ease;
  }

  .fl-map__leader::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-map__progress {
    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-map__head::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-map__hdate {
    transition: color 0.2s ease;
  }
}
</style>
