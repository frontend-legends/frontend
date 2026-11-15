<script setup lang="ts">
// Баннер aitishka.com в сайдбаре главной — младший родственник hero: имя набрано тем же
// ASCII-шрифтом (figlet slant), на фоне — сетка точек экрана загрузки. Одно движение:
// по буквам проходит волна по шкале плотности `. : - = + * # % @` акцентным цветом —
// один раз, когда баннер впервые показался, и потом на каждое наведение / фокус.
// Вся плита — одна ссылка, открывается в новой вкладке.
import LINKS from "~/const/links";

const ART = [
  "         _ __  _      __    __",
  "  ____ _(_) /_(_)____/ /_  / /______ _",
  " / __ `/ / __/ / ___/ __ \\/ //_/ __ `/",
  "/ /_/ / / /_/ (__  ) / / / ,< / /_/ /",
  "\\__,_/_/\\__/_/____/_/ /_/_/|_|\\__,_/",
];
const COLS = Math.max(...ART.map((l) => l.length));
const GRID = ART.map((l) => l.padEnd(COLS, " "));
const RAMP = ".:-=+*#%@";
const SWEEP = 900; // ms for the wave to cross the word
const TAIL = 7; // columns behind the front that still glow

const baseText = ref(GRID.join("\n"));
const inkText = ref("");
const root = ref<HTMLElement | null>(null);
let raf = 0;
const reduced = import.meta.client && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the wave: a slanted front (like the glyphs) runs left → right; behind it letters turn into ink and cool back
function sweep() {
  if (reduced || raf) return;
  const t0 = performance.now();
  const frame = (t: number) => {
    const p = Math.min(1, (t - t0) / SWEEP);
    const front = p * (COLS + TAIL + ART.length) - 2;
    const base: string[] = [];
    const ink: string[] = [];
    GRID.forEach((line, row) => {
      let b = "";
      let k = "";
      for (let col = 0; col < COLS; col++) {
        const c = line[col]!;
        const d = front - (col + (ART.length - 1 - row) * 0.8);
        const v = d >= 0 && d < TAIL ? 1 - d / TAIL : 0;
        if (c !== " " && v > 0.1) {
          b += " ";
          k += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
        } else {
          b += c;
          k += " ";
        }
      }
      base.push(b);
      ink.push(k);
    });
    baseText.value = base.join("\n");
    inkText.value = ink.join("\n");
    if (p < 1) raf = requestAnimationFrame(frame);
    else {
      raf = 0;
      baseText.value = GRID.join("\n");
      inkText.value = "";
    }
  };
  raf = requestAnimationFrame(frame);
}

// once, the first time the banner is actually seen
const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (!entry?.isIntersecting) return;
    stop();
    setTimeout(sweep, 250);
  },
  { threshold: 0.6 },
);

onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <a ref="root" :href="LINKS.aitishka" target="_blank" rel="noopener" class="fl-ai fl-slab bg-on-light text-on-dark"
    @pointerenter="sweep" @focus="sweep">
    <span class="fl-ai__art" aria-hidden="true">
      <pre class="fl-ai__ascii fl-ai__ascii--base">{{ baseText }}</pre>
      <pre class="fl-ai__ascii fl-ai__ascii--ink">{{ inkText }}</pre>
    </span>
    <span class="sr-only">aitishka</span>

    <span class="fl-ai__text">Сообщество айтишников Центральной Азии: статьи, вакансии, вопросы и&nbsp;ивенты.</span>

    <span class="fl-ai__bar">
      <span>открыть aitishka.com</span>
      <Icon name="ph:arrow-up-right-bold" class="fl-ai__ext" aria-hidden="true" />
    </span>
    <span class="sr-only"> (в новой вкладке)</span>
  </a>
</template>

<style scoped>
.fl-ai {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container-type: inline-size;

  font-family: var(--font-sans);
  text-decoration: none;
}

.fl-ai :deep(span) {
  font-family: inherit;
}

/* the word on the loader's dot lattice */
.fl-ai__art {
  display: grid;
  padding: 1.5rem 1.25rem 1.25rem;
  background-image: radial-gradient(color-mix(in srgb, currentColor 16%, transparent) 1px, transparent 1.2px);
  background-size: 12px 12px;
  background-position: 6px 6px;
}

.fl-ai__ascii {
  grid-area: 1 / 1;
  margin: 0;
  padding: 0;
  background: transparent;

  font-family: var(--font-mono);
  /* 38 columns fill the slab's width (a mono cell is ~0.6em wide); never larger than 15px */
  font-size: min(15px, calc((100cqw - 2.5rem) / 38 / 0.6));
  line-height: 1.2;
  white-space: pre;
}

.fl-ai__ascii--ink {
  color: var(--hero-ink);
  text-shadow: 0 0 10px color-mix(in srgb, var(--hero-ink) 60%, transparent);
}

.fl-ai__text {
  padding: 0 1.25rem 1.25rem;
  max-width: 34ch;

  font-size: 14px;
  line-height: 1.45;
  opacity: 0.75;
}

/* the action: a full-width bar that fills with the brand blue left → right on hover */
.fl-ai__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 1.25rem;
  border-top: 1px solid color-mix(in srgb, currentColor 16%, transparent);

  font-size: 13px;
  font-weight: 500;
  background-image: linear-gradient(var(--primary), var(--primary));
  background-repeat: no-repeat;
  background-size: 0% 100%;
}

.fl-ai__ext {
  width: 13px;
  height: 13px;
}

.fl-ai:hover .fl-ai__bar,
.fl-ai:focus-visible .fl-ai__bar {
  color: #fff;
  background-size: 100% 100%;
}

.fl-ai:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-ai__bar {
    transition: background-size 0.45s cubic-bezier(0.65, 0, 0.35, 1), color 0.2s ease 0.1s;
  }
}
</style>
