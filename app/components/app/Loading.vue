<script setup lang="ts">
// Экран загрузки в языке hero на главной: ASCII-монограмма «FL» тем же шрифтом (slant),
// по ней бежит волна — символы проходят шкалу плотности `. : - = + * # % @` и гаснут обратно.
// Два слоя, как у кисти в hero: приглушённая база и «чернила» волны акцентным цветом.
const ART = [
  "    ________",
  "   / ____/ /",
  "  / /_  / /",
  " / __/ / /___",
  "/_/   /_____/",
];
const COLS = Math.max(...ART.map((l) => l.length));
const GRID = ART.map((l) => l.padEnd(COLS, " "));
const RAMP = ".:-=+*#%@";
const PERIOD = 1100; // ms for one sweep

const baseText = ref(ART.join("\n"));
const inkText = ref("");
let raf = 0;

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const t0 = performance.now();
  const frame = (t: number) => {
    // wave front travels left → right and a little beyond, then wraps
    const front = (((t - t0) % PERIOD) / PERIOD) * (COLS + 8) - 4;
    const base: string[] = [];
    const ink: string[] = [];
    GRID.forEach((line, row) => {
      let b = "";
      let k = "";
      for (let col = 0; col < COLS; col++) {
        const c = line[col]!;
        // slanted front, like the glyphs; strength falls off behind the front
        const d = front - (col + (ART.length - 1 - row) * 0.6);
        const v = d >= 0 && d < 5 ? 1 - d / 5 : 0;
        if (c !== " " && v > 0.12) {
          b += " ";
          k += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
        } else {
          b += c;
          k += " ";
        }
      }
      base.push(b.trimEnd());
      ink.push(k.trimEnd());
    });
    baseText.value = base.join("\n");
    inkText.value = ink.join("\n");
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
});

onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <div class="fl-loading" role="status" aria-live="polite">
    <div class="fl-loading__mark" aria-hidden="true">
      <pre class="fl-loading__ascii fl-loading__ascii--base">{{ baseText }}</pre>
      <pre class="fl-loading__ascii fl-loading__ascii--ink">{{ inkText }}</pre>
    </div>
    <span class="fl-loading__label">загрузка</span>
  </div>
</template>

<style scoped>
.fl-loading {
  position: fixed;
  inset: 3px 0 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;

  background-color: color-mix(in srgb, var(--on-dark) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  user-select: none;
}

.fl-loading__mark {
  display: grid;
}

.fl-loading__ascii {
  grid-area: 1 / 1;
  margin: 0;
  padding: 0;
  background: transparent;

  font-family: var(--font-mono);
  font-size: 15px;
  line-height: 1.2;
  white-space: pre;
}

.fl-loading__ascii--base {
  color: color-mix(in srgb, var(--on-light) 55%, transparent);
}

.fl-loading__ascii--ink {
  color: var(--hero-ink);
  text-shadow: 0 0 10px color-mix(in srgb, var(--hero-ink) 60%, transparent);
}

.fl-loading .fl-loading__label {
  font-family: var(--font-sans);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--gray);
}

/* app.vue wraps this in <Transition name="loading"> */
@media (prefers-reduced-motion: no-preference) {
  .fl-loading.loading-enter-active,
  .fl-loading.loading-leave-active {
    transition: opacity 0.25s ease;
  }
}

.fl-loading.loading-enter-from,
.fl-loading.loading-leave-to {
  opacity: 0;
}
</style>
