<script setup lang="ts">
// Чип LEGEND — знак того, кто прошёл книгу целиком.
//  — сигил: 5 × 5 клеток, зеркальный, как печать; вычисляется из id пользователя (FNV-1a),
//    поэтому у каждой легенды свой и не меняется, даже если сменить имя;
//    одна клетка — лаймовая «искра», её место тоже из хеша;
//  — номер: порядок прохождения книги, место навсегда;
//  — active (наведение на строку) — буквы перебирают ASCII и встают в LEGEND,
//    по рамке пробегает искра. При prefers-reduced-motion — без анимаций.
const props = defineProps<{ seed: string; num?: number | null; active?: boolean }>();

function fnv1a(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

// 0 — пусто, 1 — клетка, 2 — искра
const cells = computed(() => {
  const h = fnv1a(props.seed);
  const on: boolean[] = new Array(25).fill(false);
  // слишком редкий знак читается как пустой: добираем клетки из следующих хешей, пока их меньше 8
  for (let salt = ""; on.filter(Boolean).length < 8 && salt.length < 4; salt += "#") {
    const bits = salt ? fnv1a(props.seed + salt) : h;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const col = c < 3 ? c : 4 - c; // правая половина — зеркало левой
        if (((bits >>> (r * 3 + col)) & 1) === 1 || (r === 2 && c === 2)) on[r * 5 + c] = true;
      }
    }
  }
  const lit = on.flatMap((v, i) => (v ? [i] : []));
  const spark = lit[(h >>> 17) % lit.length];
  return on.map((v, i) => (i === spark ? 2 : v ? 1 : 0));
});

const serial = computed(() => (props.num ? String(props.num).padStart(3, "0") : ""));

const WORD = "legend";
const GLYPHS = "#%&@$*+=/<>01";
const frame = ref(-1); // -1 — покой, слово целиком
let timer: ReturnType<typeof setInterval> | undefined;

const fx = computed(() =>
  frame.value < 0
    ? WORD
    : WORD.split("")
        .map((ch, i) => (frame.value > 3 + i * 2 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join(""),
);

function ignite() {
  clearInterval(timer);
  if (import.meta.server || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  frame.value = 0;
  timer = setInterval(() => {
    frame.value += 1;
    if (frame.value > 16) {
      clearInterval(timer);
      frame.value = -1;
    }
  }, 34);
}

watch(
  () => props.active,
  (on) => {
    if (on) ignite();
    else {
      clearInterval(timer);
      frame.value = -1;
    }
  },
);
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <span class="fl-lg" :class="{ 'is-active': active, 'is-lit': frame >= 0 }">
    <span class="fl-lg__mark" aria-hidden="true">
      <span v-for="(c, i) in cells" :key="i" class="fl-lg__cell" :class="{ 'is-on': c === 1, 'is-spark': c === 2 }" />
    </span>
    <span class="fl-lg__text" aria-hidden="true">
      <span class="fl-lg__word">{{ WORD }}</span>
      <span class="fl-lg__fx">{{ fx }}</span>
    </span>
    <span v-if="serial" class="fl-lg__num" aria-hidden="true">{{ serial }}</span>
    <span class="fl-lg__sr">{{ num ? `легенда № ${num}` : "легенда" }}</span>
  </span>
</template>

<style scoped>
@property --fl-lg-a {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

/* a two-part tile in the header cells' language: the sigil square, the word and the serial
   in a hairline frame */
.fl-lg {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: stretch;
  height: 20px;
  border: 1px solid color-mix(in srgb, var(--on-light) 38%, transparent);

  font-family: var(--font-main);
  font-size: 10px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--on-light);
  user-select: none;
}

/* the spark running round the frame while the row is hovered */
.fl-lg::before {
  content: "";
  position: absolute;
  inset: -1px;
  padding: 1px;
  background: conic-gradient(from var(--fl-lg-a), transparent 0 70%, var(--secondary) 84% 88%, transparent 92%);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.fl-lg.is-active::before {
  opacity: 1;
}

.fl-lg__mark {
  display: grid;
  grid-template-columns: repeat(5, 3px);
  grid-template-rows: repeat(5, 3px);
  place-content: center;
  width: 18px;
  background-color: var(--primary);
}

.fl-lg__cell.is-on {
  background-color: var(--light);
}

.fl-lg__cell.is-spark {
  background-color: var(--secondary);
}

/* the real word keeps the width; the scramble is drawn over it */
.fl-lg__text {
  position: relative;
  padding: 0 6px 0 7px;
}

.fl-lg__fx {
  position: absolute;
  inset: 0 6px 0 7px;
  visibility: hidden;
}

.fl-lg.is-lit .fl-lg__word {
  visibility: hidden;
}

.fl-lg.is-lit .fl-lg__fx {
  visibility: visible;
}

.fl-lg__num {
  padding: 0 6px;
  border-left: 1px solid color-mix(in srgb, var(--on-light) 18%, transparent);

  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--gray);
}

.fl-lg__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-lg::before {
    animation: fl-lg-spin 2.2s linear infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* no motion: the whole frame lights up instead of a running spark */
  .fl-lg::before {
    background: var(--secondary);
  }
}

@keyframes fl-lg-spin {
  to {
    --fl-lg-a: 360deg;
  }
}

/* phones: the sigil and the serial, the name keeps the room */
@media (max-width: 639.98px) {
  .fl-lg__text {
    display: none;
  }
}
</style>
