<script setup lang="ts">
// Левая половина auth-страниц: колода настоящих вопросов с собеседования из книги.
// Язык шапки статьи (инвертированная плита, размытый номер главы водяным знаком)
// + ячейки как в шапке сайта (48px, волосяные швы, полоса 3px снизу на hover).
const { cards, ready } = useInterviewDeck();

// автосмена: линия под верхней строкой заполняется за DURATION секунд, потом — следующий вопрос
const DURATION = 8;

const index = ref(0);
const open = ref(false);
// ручная пауза; с prefers-reduced-motion колода стартует на паузе
const paused = ref(false);
const mountedAt = ref(0);
// first reveal waits for the slab wipe-in; later reveals start immediately
const baseDelay = ref(0);

onMounted(() => {
  mountedAt.value = performance.now();
  paused.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

// hover / keyboard focus / open answer pause the fill in CSS, so it only ends when it really ran out
function onProgressEnd(e: AnimationEvent) {
  if (e.animationName.includes("fl-deck-progress")) go(1);
}

watch(
  ready,
  (isReady) => {
    if (!isReady || !cards.value.length) return;
    index.value = Math.floor(Math.random() * cards.value.length);
    baseDelay.value = Math.max(0, 480 - (performance.now() - mountedAt.value));
  },
  { immediate: true },
);

const total = computed(() => cards.value.length);
const card = computed(() => cards.value[index.value]);
// split into words, but keep a parenthesised group whole: «setCount(count + 1)» never breaks inside
const words = computed(() => card.value?.q.match(/(?:\([^)]*\)|[^\s(])+/g) ?? []);
const isLong = computed(() => (card.value?.q.length ?? 0) > 58);

const fmtOrder = (o: number) => Number(o).toFixed(2);
const pad = (n: number) => String(n).padStart(String(total.value).length, "0");

function go(step: number) {
  if (!total.value) return;
  index.value = (index.value + step + total.value) % total.value;
  open.value = false;
  baseDelay.value = 0;
}

// Fit: the longest word (dangerouslySetInnerHTML, setCount(count + 1)…) must fit the column.
// Measure at the CSS size, then scale the font down just enough. Runs on every card and on resize.
const bodyRef = ref<HTMLElement | null>(null);
const qRef = ref<HTMLElement | null>(null);
const fit = ref(1);

async function fitQuestion() {
  await nextTick();
  const body = bodyRef.value;
  const q = qRef.value;
  if (!body || !q) return;
  fit.value = 1;
  await nextTick();
  const cs = getComputedStyle(body);
  const available = body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const widest = Math.max(...[...q.querySelectorAll<HTMLElement>(".fl-deck__word")].map((w) => w.offsetWidth));
  if (widest > available) fit.value = Math.max(0.45, (available / widest) * 0.98);
}

watch(card, fitQuestion, { flush: "post" });
let ro: ResizeObserver | undefined;
onMounted(() => {
  ro = new ResizeObserver(() => fitQuestion());
  if (bodyRef.value) ro.observe(bodyRef.value);
});
onBeforeUnmount(() => ro?.disconnect());

// ← / → листают колоду, если фокус не в поле ввода
function onKey(e: KeyboardEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input, textarea, select, [contenteditable]")) return;
  if (e.key === "ArrowRight") go(1);
  else if (e.key === "ArrowLeft") go(-1);
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <aside class="fl-deck fl-slab bg-on-light text-on-dark" :class="{ 'is-paused': paused || open }"
    aria-label="Вопросы с собеседования из книги">
    <Transition name="fl-deck-wm">
      <span v-if="card" :key="card.order" class="fl-deck__wm" aria-hidden="true">{{ fmtOrder(card.order) }}</span>
    </Transition>

    <!-- 48px row: same height and seams as the site header -->
    <div class="fl-deck__bar">
      <span class="fl-deck__label">спросят на собеседовании</span>
      <span v-if="total" class="fl-deck__count">
        <span class="sr-only">Вопрос</span> {{ pad(index + 1) }} <span class="fl-deck__count-of">/ {{ total }}</span>
      </span>
      <button type="button" class="fl-deck__cell" :aria-label="paused ? 'Листать автоматически' : 'Остановить автосмену'"
        :aria-pressed="paused" :disabled="!total"
        @click="paused = !paused">
        <Icon :name="paused ? 'ph:play-bold' : 'ph:pause-bold'" />
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">{{ paused ? 'листать автоматически' : 'пауза' }}</q-tooltip>
      </button>
      <button type="button" class="fl-deck__cell" aria-label="Предыдущий вопрос"
        :disabled="!total" @click="go(-1)">
        <Icon name="ph:arrow-left-bold" />
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">предыдущий вопрос (←)</q-tooltip>
      </button>
      <button type="button" class="fl-deck__cell" aria-label="Следующий вопрос"
        :disabled="!total" @click="go(1)">
        <Icon name="ph:arrow-right-bold" />
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">следующий вопрос (→)</q-tooltip>
      </button>

      <!-- progress of the auto-advance: fills the seam under the row -->
      <span v-if="card" class="fl-deck__progress" aria-hidden="true">
        <span :key="`p-${index}`" class="fl-deck__progress-fill" :style="{ '--dur': `${DURATION}s` }"
          @animationend="onProgressEnd" />
      </span>
    </div>

    <div ref="bodyRef" class="fl-deck__body">
      <template v-if="card">
        <p :key="`q-${index}`" ref="qRef" class="fl-deck__q" :class="{ 'is-long': isLong }" aria-live="polite"
          :style="{ '--base': `${baseDelay}ms`, '--fit': fit }">
          <span v-for="(w, i) in words" :key="i" class="fl-deck__word" :style="{ '--i': i }">{{ w }}</span>
        </p>

        <details :key="`a-${index}`" :open="open" class="fl-deck__answer"
          @toggle="open = ($event.target as HTMLDetailsElement).open">
          <summary class="fl-deck__summary">
            <!-- same order as ::practice in articles: hairline, then the toggle on the right -->
            <span class="fl-deck__rule" aria-hidden="true" />
            <span class="fl-deck__toggle">{{ open ? "скрыть ответ" : "показать ответ" }}</span>
            <span class="fl-deck__icon" aria-hidden="true" />
          </summary>

          <div class="fl-deck__a">
            <p>
              <template v-for="(s, i) in card.a" :key="i">
                <code v-if="s.code">{{ s.text }}</code>
                <template v-else>{{ s.text }}</template>
              </template>
            </p>
            <NuxtLink :to="card.href" class="fl-deck__source">
              <span class="fl-deck__source-text">читать главу {{ fmtOrder(card.order) }} {{ card.title.toLowerCase() }}</span>
              <Icon name="ph:arrow-right-bold" class="fl-deck__source-arrow" />
            </NuxtLink>
          </div>
        </details>
      </template>

      <div v-else-if="ready" class="fl-deck__empty">Вопросы не загрузились. Они есть в каждой главе книги.</div>
    </div>
  </aside>
</template>

<style scoped>
.fl-deck {
  --seam: color-mix(in srgb, var(--on-dark) 14%, transparent);

  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-rows: 48px minmax(0, 1fr);
}

/* ---------- watermark: chapter number ---------- */
.fl-deck__wm {
  position: absolute;
  right: -0.06em;
  bottom: -0.2em;
  z-index: 0;

  font-family: var(--font-main);
  font-size: clamp(180px, 24vw, 360px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
  white-space: nowrap;

  opacity: 0.07;
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

/* ---------- 48px bar ---------- */
.fl-deck__bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--seam);
}

.fl-deck__label {
  flex: 1;
  min-width: 0;
  padding-left: 1.5rem;

  font-family: var(--font-sans);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
}

.fl-deck__count {
  padding: 0 1rem;

  font-family: var(--font-main);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.fl-deck__count-of {
  opacity: 0.5;
}

.fl-deck__cell {
  position: relative;
  display: grid;
  place-items: center;
  align-self: stretch;
  width: 56px;
  padding: 0;
  border: 0;
  border-left: 1px solid var(--seam);
  border-radius: 0;
  background: none;

  color: inherit;
  cursor: pointer;
  opacity: 0.8;
}

/* hover bar grows along the bottom — exactly like the header's nav cells */
.fl-deck__cell::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0.5px; /* same resting gap as the header bar (AppNav sits on a half pixel) */
  width: 0;
  height: 3px;
  background-color: var(--on-dark);
}

.fl-deck__cell:hover {
  opacity: 1;
}

.fl-deck__cell:hover::after {
  width: 100%;
}

.fl-deck__cell:disabled {
  cursor: default;
  opacity: 0.3;
}

.fl-deck__cell:focus-visible,
.fl-deck__summary:focus-visible,
.fl-deck__source:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

/* auto-advance progress: a 2px line over the seam under the bar */
.fl-deck__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  pointer-events: none;
}

.fl-deck__progress-fill {
  position: absolute;
  inset: 0;
  background-color: var(--on-dark);
  transform: scaleX(0);
  transform-origin: left;
  animation: fl-deck-progress var(--dur, 8s) linear forwards;
}

/* stop the clock while the reader is busy with the card */
.fl-deck:hover .fl-deck__progress-fill,
.fl-deck:has(:focus-visible) .fl-deck__progress-fill,
.fl-deck.is-paused .fl-deck__progress-fill {
  animation-play-state: paused;
}

.fl-deck.is-paused .fl-deck__progress-fill {
  opacity: 0.35;
}

/* ---------- body ---------- */
.fl-deck__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 3rem 1.5rem 2.5rem;
}

.fl-deck__q {
  max-width: 15ch;
  margin: 0;

  font-family: var(--font-sans);
  font-weight: 700; /* 600 is missing in the uno Inter subset: latin would fall back to another weight */
  font-size: calc(clamp(2.1rem, 3.6vw, 3.6rem) * var(--fit, 1));
  line-height: 1.03;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.fl-deck__q.is-long {
  max-width: 18ch;
  font-size: calc(clamp(1.8rem, 2.8vw, 2.75rem) * var(--fit, 1));
  line-height: 1.06;
}

/* inline-block for the per-word reveal; the gap replaces the collapsed spaces */
.fl-deck__word {
  display: inline-block;
  margin-right: 0.22em;
  white-space: nowrap;
}

/* ---------- answer ---------- */
.fl-deck__answer {
  margin-top: 2rem;
}

.fl-deck__summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;

  cursor: pointer;
  list-style: none;
  user-select: none;
}

.fl-deck__summary::-webkit-details-marker {
  display: none;
}

.fl-deck__toggle {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  opacity: 0.75;
}

.fl-deck__summary:hover .fl-deck__toggle,
.fl-deck__answer[open] .fl-deck__toggle {
  opacity: 1;
}

/* plus → cross, same glyph as ::question */
.fl-deck__icon {
  position: relative;
  flex-shrink: 0;
  width: 11px;
  height: 11px;
}

.fl-deck__icon::before,
.fl-deck__icon::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  margin-top: -0.75px;
  background-color: currentColor;
}

.fl-deck__icon::after {
  transform: rotate(90deg);
}

.fl-deck__answer[open] .fl-deck__icon {
  transform: rotate(45deg);
}

/* hairline to the edge; a solid line sweeps over it on hover */
.fl-deck__rule {
  position: relative;
  flex: 1;
  height: 1px;
  background-color: var(--seam);
}

.fl-deck__rule::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--on-dark);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-deck__summary:hover .fl-deck__rule::after {
  transform: scaleX(1);
}

/* smooth open AND close: the native details box animates its height (progressive enhancement) */
.fl-deck__answer {
  interpolate-size: allow-keywords;
}

.fl-deck__answer::details-content {
  block-size: 0;
  overflow: hidden;
  opacity: 0;
}

.fl-deck__answer[open]::details-content {
  block-size: auto;
  opacity: 1;
}

.fl-deck__a {
  padding-top: 0.9rem;
}

.fl-deck__a p {
  max-width: 52ch;
  margin: 0;
  overflow-wrap: anywhere; /* long tokens in answers wrap instead of leaving the slab */

  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.82;
}

.fl-deck__a code {
  padding: 0.05em 0.35em;

  font-family: var(--font-sans);
  font-size: 0.88em;
  font-weight: 600;
  background-color: color-mix(in srgb, var(--on-dark) 13%, transparent);
}

.fl-deck__source {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.1rem;

  font-family: var(--font-sans);
  font-size: 13px;
  text-decoration: none;
  color: inherit;
  opacity: 0.65;
}

.fl-deck__source:hover {
  opacity: 1;
}

.fl-deck__source-text {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  text-decoration-color: color-mix(in srgb, var(--on-dark) 45%, transparent);
}

.fl-deck__source:hover .fl-deck__source-text {
  text-decoration-color: currentColor;
}

.fl-deck__source-arrow {
  width: 13px;
  height: 13px;
}

.fl-deck__source:hover .fl-deck__source-arrow {
  transform: translateX(3px);
}

.fl-deck__empty {
  max-width: 30ch;
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  opacity: 0.7;
}

/* desktop: label, question and answer share one left edge with the header's logo text (44px) */
@media (min-width: 1024px) {
  .fl-deck__label {
    padding-left: 44px;
  }

  .fl-deck__body {
    padding: 4rem 44px 3rem;
  }
}

/* motion: the question sets itself word by word (after the slab wipe on first load) */
@media (prefers-reduced-motion: no-preference) {
  .fl-deck__word {
    animation: fl-deck-word 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--base, 0ms) + var(--i) * 38ms);
  }

  .fl-deck__answer::details-content {
    transition:
      block-size 0.5s cubic-bezier(0.65, 0, 0.35, 1),
      opacity 0.35s ease,
      content-visibility 0.5s allow-discrete;
  }

  .fl-deck-wm-enter-active,
  .fl-deck-wm-leave-active {
    transition: opacity 0.6s ease, filter 0.6s ease;
  }

  .fl-deck-wm-enter-from,
  .fl-deck-wm-leave-to {
    opacity: 0;
    filter: blur(16px);
  }

  .fl-deck__cell {
    transition: opacity 0.2s ease;
  }

  .fl-deck__cell::after {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fl-deck__rule::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-deck__icon {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-deck__source,
  .fl-deck__toggle {
    transition: opacity 0.2s ease;
  }

  .fl-deck__source-arrow {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}

/* leaving watermark overlaps the entering one */
.fl-deck-wm-leave-active {
  position: absolute;
}

@keyframes fl-deck-word {
  from {
    opacity: 0;
    transform: translateY(0.45em);
    filter: blur(6px);
  }
}

@keyframes fl-deck-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
