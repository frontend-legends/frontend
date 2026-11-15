<script setup lang="ts">
// Экран загрузки в языке hero на главной: ASCII-орбита. На пустом поле
// по эллипсу кружат четыре частицы, за каждой — хвост по шкале плотности `@ % # * + = - : .`,
// который остывает, как след кисти в hero. Скорости чуть разные: частицы то догоняют друг друга
// и сливаются, то расходятся — картинка не повторяется.
// Та же анимация — в стартовом экране до загрузки приложения (app/spa-loading-template.html).
const COLS = 31;
const ROWS = 9;
const RAMP = ".:-=+*#%@";

// the base layer is blank: it only holds the grid's size, the sparks fly on an empty field
const BLANK = Array.from({ length: ROWS }, () => " ".repeat(COLS));

const baseText = ref(BLANK.join("\n"));
const inkText = ref("");
let raf = 0;

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const heat = new Float32Array(COLS * ROWS);
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  const rx = COLS / 2 - 2.5;
  const ry = ROWS / 2 - 1;
  const sparks = [0, 1, 2, 3].map((i) => ({ phase: (i * Math.PI) / 2, speed: 2.1 + i * 0.23, wobble: 0.5 + i * 0.7 }));

  const t0 = performance.now();
  let prev = t0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const t = (now - t0) / 1000;

    // cool the trails (frame-rate independent)
    const cool = Math.pow(0.84, dt * 60);
    for (let i = 0; i < heat.length; i++) heat[i]! *= cool;

    // each spark heats the cells around it; cells are ~2× taller than wide, so y distance counts double
    for (const s of sparks) {
      const a = s.phase + t * s.speed;
      const k = 1 + 0.12 * Math.sin(a * 3 + t * s.wobble);
      const x = cx + Math.cos(a) * rx * k;
      const y = cy + Math.sin(a) * ry * k;
      for (let r = Math.floor(y - 1); r <= Math.ceil(y + 1); r++) {
        if (r < 0 || r >= ROWS) continue;
        for (let c = Math.floor(x - 2); c <= Math.ceil(x + 2); c++) {
          if (c < 0 || c >= COLS) continue;
          const d = Math.hypot(c - x, (r - y) * 2);
          if (d < 1.6) heat[r * COLS + c] = Math.min(1, heat[r * COLS + c]! + (1 - d / 1.6) * 0.55);
        }
      }
    }

    const base: string[] = [];
    const ink: string[] = [];
    for (let r = 0; r < ROWS; r++) {
      let b = "";
      let k = "";
      for (let c = 0; c < COLS; c++) {
        const v = heat[r * COLS + c]!;
        if (v > 0.06) {
          b += " ";
          k += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
        } else {
          b += " ";
          k += " ";
        }
      }
      base.push(b);
      ink.push(k);
    }
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
