<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import { usersGql } from '~/api/app';
import { useAuthStore } from '~/store/auth.store';
import LINKS from '~/const/links';
import PATHS from '~/const/paths';

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);
const isAuth = computed(() => authStore.getAuth);

const { data: page } = await useAsyncData("/", () => {
  return queryCollection('content')
    .where("order", "=", "0")
    .first()
});

// expose frontmatter (order/date) to ProseH1 so the root gets its tagline
provide("contentPage", page);

const now = useNow();
const leaderboardVars = computed(() => ({
  year: new Date(now.value).getFullYear(),
  month: new Date(now.value).getMonth() + 1,
  limit: 10,
}));

const { result, loading, error } = useQuery(usersGql.MONTHLY_LEADERBOARD, leaderboardVars);

const users = computed(() => result.value?.monthly_leaderboard || []);

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const { totalDone, totalStories } = useBookMap();

// ---------- hero ----------
const ASCII = "    ______                 __                 __               \n   / ____/________  ____  / /____  ____  ____/ /               \n  / /_  / ___/ __ \\/ __ \\/ __/ _ \\/ __ \\/ __  /                \n / __/ / /  / /_/ / / / / /_/  __/ / / / /_/ /                 \n/_/   /_/   \\____/_/ /_/\\__/\\___/_/ /_/\\__,_/            __    \n                        / /   ___  ____ ____  ____  ____/ /____\n                       / /   / _ \\/ __ `/ _ \\/ __ \\/ __  / ___/\n                      / /___/  __/ /_/ /  __/ / / / /_/ (__  ) \n                     /_____/\\___/\\__, /\\___/_/ /_/\\__,_/____/  \n                                /____/                         ";
const GLYPHS = "/\\_|()-=+<>`,.";
const RAMP = ".:-=+*#%@";
const RADIUS = 64; // px

const heroRef = ref<HTMLElement | null>(null);
const baseRef = ref<HTMLElement | null>(null);
const probeRef = ref<HTMLElement | null>(null);

// the art itself
const ART = ASCII.split("\n");
const ART_ROWS = ART.length;
const ART_COLS = Math.max(...ART.map((l) => l.length));

// the field: a character grid that covers the whole hero, with the art centered in it,
// so the brush (and the ghost) can paint edge to edge, not only over the letters
const grid = { rows: ART_ROWS, cols: ART_COLS, cells: [] as string[], cw: 0, ch: 0 };
const field = { energy: new Float32Array(0), active: false, raf: 0, last: null as null | { x: number; y: number } };

const toText = (cells: string[]) =>
  Array.from({ length: grid.rows }, (_, r) => cells.slice(r * grid.cols, (r + 1) * grid.cols).join("")).join("\n");

const baseText = ref(ASCII);
const inkText = ref("");

function layout() {
  const hero = heroRef.value;
  const probe = probeRef.value;
  if (!hero || !probe) return;
  const pr = probe.getBoundingClientRect();
  const cw = pr.width / 100;
  const ch = pr.height;
  if (!cw || !ch) return;
  const cols = Math.max(ART_COLS, Math.floor(hero.clientWidth / cw));
  const rows = Math.max(ART_ROWS, Math.floor(hero.clientHeight / ch));
  grid.cw = cw;
  grid.ch = ch;
  if (cols === grid.cols && rows === grid.rows && grid.cells.length) return;
  const c0 = Math.floor((cols - ART_COLS) / 2);
  const r0 = Math.floor((rows - ART_ROWS) / 2);
  const cells: string[] = new Array(rows * cols).fill(" ");
  ART.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) cells[(r + r0) * cols + c + c0] = line[c]!;
  });
  Object.assign(grid, { rows, cols, cells });
  field.energy = new Float32Array(rows * cols);
  if (!field.active) {
    baseText.value = toText(cells);
    inkText.value = "";
  }
}

// 1) intro: glyphs scramble and settle left → right
function intro() {
  const settleAt = grid.cells.map((_, i) => ((i % grid.cols) / grid.cols) * 750 + Math.random() * 250);
  const t0 = performance.now();
  const frame = (t: number) => {
    const dt = t - t0;
    let done = true;
    const cells = grid.cells.map((c, i) => {
      if (c === " " || dt >= settleAt[i]!) return c;
      done = false;
      return GLYPHS[(Math.random() * GLYPHS.length) | 0]!;
    });
    if (!field.active) baseText.value = toText(cells);
    if (!done) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// 2) the pointer is an ASCII brush: cells near it heat up and turn into a density ramp,
//    the trail cools back into the original glyphs. Works on empty cells too, so it paints the field.
function paint() {
  const e = field.energy;
  const base: string[] = new Array(e.length);
  const ink: string[] = new Array(e.length);
  let alive = false;
  for (let i = 0; i < e.length; i++) {
    let v = e[i]! * 0.93; // cooling
    if (v < 0.04) v = 0;
    e[i] = v;
    if (v > 0.1) {
      alive = true;
      base[i] = " ";
      ink[i] = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]!;
    } else {
      if (v > 0) alive = true;
      base[i] = grid.cells[i]!;
      ink[i] = " ";
    }
  }
  baseText.value = toText(base);
  inkText.value = toText(ink);
  if (alive) field.raf = requestAnimationFrame(paint);
  else {
    field.active = false;
    field.raf = 0;
    baseText.value = toText(grid.cells);
    inkText.value = "";
  }
}

// heat cells around (x, y) — coordinates are px inside the field
function stroke(x: number, y: number, speed: number, radius = RADIUS) {
  const { cw, ch, cols, rows } = grid;
  if (!cw) return;
  const c0 = Math.max(0, Math.floor((x - radius) / cw));
  const c1 = Math.min(cols - 1, Math.ceil((x + radius) / cw));
  const r0 = Math.max(0, Math.floor((y - radius) / ch));
  const r1 = Math.min(rows - 1, Math.ceil((y + radius) / ch));
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      const d = Math.hypot((col + 0.5) * cw - x, (row + 0.5) * ch - y);
      if (d > radius) continue;
      const i = row * cols + col;
      const k = (1 - d / radius) ** 2;
      field.energy[i] = Math.min(1, field.energy[i]! + k * (0.35 + 0.65 * speed));
    }
  }
  field.active = true;
  if (!field.raf) field.raf = requestAnimationFrame(paint);
}

const pointer = { inside: false, lastMove: 0 };

function onPointer(e: PointerEvent) {
  const pre = baseRef.value;
  if (!pre) return;
  pointer.inside = true;
  pointer.lastMove = performance.now();
  stopGhost();
  const r = pre.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  // faster strokes leave denser ink
  const speed = field.last ? Math.min(1, Math.hypot(x - field.last.x, y - field.last.y) / 18) : 0.4;
  field.last = { x, y };
  stroke(x, y, speed);
}

function onPointerLeave() {
  field.last = null;
  pointer.inside = false;
  pointer.lastMove = performance.now();
}

// 3) glitch: when nobody is touching the hero, the wordmark glitches now and then,
//    built from the same glyphs — row bands tear and slide across the full width (wrapping),
//    letters flicker into noise, an accent-coloured ghost copy splits off, scanlines streak edge to edge.
//    Tuned to be a hint, not an alarm.
const TEAR = "-_=~";
const ghost = { raf: 0, timer: undefined as number | undefined };
const glitching = ref(false);
const heroVisible = ref(true);
const docVisibility = useDocumentVisibility();
useIntersectionObserver(heroRef, ([entry]) => {
  heroVisible.value = !!entry?.isIntersecting;
});

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

function restoreField() {
  baseText.value = toText(grid.cells);
  inkText.value = "";
}

// the user took over: drop the running glitch, try again once they are idle
function stopGhost() {
  if (!ghost.raf) return;
  cancelAnimationFrame(ghost.raf);
  ghost.raf = 0;
  glitching.value = false;
  if (!field.active) restoreField();
  scheduleGhost();
}

// one glitched frame; `k` (0..1) is how violent it is
function glitchFrame(k: number) {
  const { rows, cols, cells } = grid;
  const n = rows * cols;
  const base = cells.slice();
  const ink: string[] = new Array(n).fill(" ");
  const artTop = Math.floor((rows - ART_ROWS) / 2);
  const at = (r: number, c: number) => r * cols + (((c % cols) + cols) % cols);

  // torn bands: a row or two slides sideways, wrapping around the whole field
  const bands = randInt(1, 1 + Math.round(1.5 * k));
  for (let b = 0; b < bands; b++) {
    const r0 = randInt(artTop, artTop + ART_ROWS - 1);
    const h = randInt(1, 2);
    const far = Math.random() < 0.15;
    const shift = Math.round(rand(-1, 1) * cols * (far ? 0.25 : 0.04) * (0.5 + k * 0.5)) || 1;
    const split = Math.random() < 0.5 ? 1 : -1;
    for (let r = Math.max(0, r0); r < Math.min(rows, r0 + h); r++) {
      for (let c = 0; c < cols; c++) base[r * cols + c] = " ";
      for (let c = 0; c < cols; c++) {
        const ch = cells[r * cols + c]!;
        if (ch === " ") continue;
        base[at(r, c + shift)] = ch;
        // chromatic split: an accent copy one cell off
        const j = at(r, c + shift + split);
        if (base[j] === " ") ink[j] = ch;
      }
    }
  }

  // flicker: a few letters turn into noise for a frame
  for (let i = 0; i < n; i++) {
    if (base[i] === " " || Math.random() > 0.04 * k) continue;
    base[i] = GLYPHS[(Math.random() * GLYPHS.length) | 0]!;
  }

  // scanline: a sparse broken streak across the full width
  if (Math.random() < 0.25 * k) {
    const r = randInt(0, rows - 1);
    for (let c = 0; c < cols; c++) {
      if (base[r * cols + c] === " " && Math.random() < 0.3) ink[r * cols + c] = TEAR[(Math.random() * TEAR.length) | 0]!;
    }
  }

  // block artefact: now and then one small dense strip
  if (Math.random() < 0.3 * k) {
    const r = randInt(0, rows - 1);
    const c0 = randInt(0, cols - 4);
    const w = randInt(3, 7);
    for (let c = c0; c < Math.min(cols, c0 + w); c++) {
      base[r * cols + c] = " ";
      ink[r * cols + c] = RAMP[randInt(2, RAMP.length - 3)]!;
    }
  }

  baseText.value = toText(base);
  inkText.value = toText(ink);
}

// a burst: stepped (not per-frame) updates read as digital, intensity peaks mid-burst
function runGlitch(done: () => void) {
  const dur = rand(220, 420);
  const t0 = performance.now();
  let next = 0;
  glitching.value = true;
  const frame = (t: number) => {
    const p = (t - t0) / dur;
    if (p >= 1) {
      glitching.value = false;
      restoreField();
      done();
      return;
    }
    if (t >= next) {
      next = t + rand(45, 90);
      // occasionally a clean frame mid-burst — the stutter sells it
      if (Math.random() < 0.25) restoreField();
      else glitchFrame(Math.sin(p * Math.PI) * rand(0.5, 0.8));
    }
    ghost.raf = requestAnimationFrame(frame);
  };
  ghost.raf = requestAnimationFrame(frame);
}

function scheduleGhost(delay = rand(4500, 8500)) {
  clearTimeout(ghost.timer);
  ghost.timer = window.setTimeout(() => {
    const idle = !pointer.inside && !field.active && performance.now() - pointer.lastMove > 2500;
    if (!idle || !heroVisible.value || docVisibility.value !== "visible" || ghost.raf) {
      scheduleGhost(1500);
      return;
    }
    // sometimes a double hit: burst, short silence, burst
    const double = Math.random() < 0.25;
    runGlitch(() => {
      ghost.raf = 0;
      if (double) {
        ghost.timer = window.setTimeout(() => runGlitch(() => {
          ghost.raf = 0;
          scheduleGhost();
        }), rand(140, 260));
      } else scheduleGhost();
    });
  }, delay);
}

let resizeObs: ResizeObserver | null = null;

onMounted(async () => {
  await document.fonts?.ready;
  layout();
  resizeObs = new ResizeObserver(() => layout());
  if (heroRef.value) resizeObs.observe(heroRef.value);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  intro();
  scheduleGhost(2500);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(field.raf);
  cancelAnimationFrame(ghost.raf);
  clearTimeout(ghost.timer);
  resizeObs?.disconnect();
});

const greetingRu = computed(() => {
  const h = new Date(now.value).getHours();
  if (h >= 5 && h < 12) return "доброе утро";
  if (h >= 12 && h < 17) return "добрый день";
  if (h >= 17 && h < 23) return "добрый вечер";
  return "доброй ночи";
});

const formattedCreatedAt = computed(() => {
  const ts = user.value?.createdAt;
  if (!ts) return null;

  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});
</script>
<template>
  <div>
    <!-- fractal glass refraction filter -->
    <svg width="0" height="0" aria-hidden="true" style="position: absolute">
      <filter id="fl-fractal" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.022 0.006" numOctaves="3" seed="11" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G"
          result="disp" />
        <feGaussianBlur in="disp" stdDeviation="0 16" />
      </filter>
    </svg>

    <!-- hero: the ASCII wordmark decodes itself once, glitches on its own when idle; the pointer paints with ASCII (density ramp, cooling trail) -->
    <div ref="heroRef" class="fl-hero relative my-8 flex items-center justify-center overflow-hidden min-h-[340px]"
      @pointermove="onPointer" @pointerleave="onPointerLeave">
      <div class="fractal" aria-hidden="true">
        <div class="fractal-color" />
      </div>
      <h2 class="sr-only">Frontend Legends</h2>
      <div class="ascii-stack relative z-2 max-w-full overflow-hidden" aria-hidden="true">
        <pre ref="probeRef" class="ascii ascii--probe">{{ "x".repeat(100) }}</pre>
        <pre ref="baseRef" class="ascii ascii--base">{{ baseText }}</pre>
        <pre class="ascii ascii--ink" :class="{ 'ascii--ink-soft': glitching }">{{ inkText }}</pre>
      </div>
    </div>
    <div class="flex gap-y-4 gap-x-24" v-if="page">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex flex-col flex-1">
          <ContentRenderer :value="page" class="prose" />
        </div>
      </div>

      <!-- sidebar in the book's language: ledger blocks on hairlines, no boxes, no colored buttons -->
      <aside class="fl-side flex-1 lg:sticky right-0 top-[100px] min-w-[280px] h-fit">
        <!-- reader: progress / guest: sign-in -->
        <div class="fl-side__block">
          <template v-if="isAuth">
            <div class="fl-side__label">
              <Icon :name="getGreeting(String(new Date(now))).icon" aria-hidden="true" />
              <span>{{ greetingRu }}, {{ user?.displayName || "читатель" }}</span>
            </div>
            <div class="fl-side__big">
              {{ totalDone }}<span class="fl-side__big-of"> / {{ totalStories }}</span>
            </div>
            <div class="fl-side__caption">
              {{ ruPlural(totalDone, "тема пройдена", "темы пройдены", "тем пройдено") }}<template
                v-if="formattedCreatedAt">, путь начат {{ formattedCreatedAt }}</template>
            </div>
            <div class="fl-side__progress" aria-hidden="true">
              <span :style="{ '--pct': totalStories ? totalDone / totalStories : 0 }" />
            </div>
          </template>

          <template v-else>
            <div class="fl-side__label">прогресс</div>
            <p class="fl-side__title">Отмечай пройденные темы и&nbsp;поднимайся в&nbsp;рейтинге.</p>
            <AuthSubmit :to="PATHS.signin">Войти</AuthSubmit>
          </template>
        </div>

        <!-- leaderboard -->
        <div class="fl-side__block">
          <div class="fl-side__head">
            <span class="fl-side__label">топ за {{ useDateFormat(now, "MMMM", { locales: "ru" }) }}</span>
            <NuxtLink :to="PATHS.ladder" class="fl-side__more">весь рейтинг</NuxtLink>
          </div>

          <div v-if="loading" class="fl-side__note">Загрузка…</div>
          <div v-else-if="error" class="fl-side__note">Рейтинг не загрузился.</div>
          <ol v-else-if="users.length" class="fl-side__board">
            <li v-for="u in users.slice(0, 5)" :key="u.user.id" class="fl-side__row">
              <span class="fl-side__rank">{{ String(u.rank).padStart(2, "0") }}</span>
              <span class="fl-side__avatar" aria-hidden="true">{{ initials(u.user.name) }}</span>
              <span class="fl-side__name">{{ u.user.name }}</span>
              <span class="fl-side__count">{{ u.stories_finished }}</span>
            </li>
          </ol>
          <div v-else class="fl-side__note">В этом месяце пока никого. Пройди тему — и ты первый.</div>
        </div>

        <!-- community: rows in the map's language (title, отточие, what it is, ↗) -->
        <div class="fl-side__block">
          <span class="fl-side__label">сообщество</span>
          <ul class="fl-side__community">
            <li>
              <a :href="LINKS.telegram" target="_blank" rel="noopener noreferrer" class="fl-side__crow">
                <Icon name="ph:telegram-logo-bold" class="fl-side__cicon" aria-hidden="true" />
                <span class="fl-side__cname">Telegram</span>
                <span class="fl-side__leader" aria-hidden="true" />
                <span class="fl-side__cdesc">новые главы</span>
                <Icon name="ph:arrow-up-right-bold" class="fl-side__cext" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a :href="LINKS.github" target="_blank" rel="noopener noreferrer" class="fl-side__crow">
                <Icon name="ph:github-logo-bold" class="fl-side__cicon" aria-hidden="true" />
                <span class="fl-side__cname">GitHub</span>
                <span class="fl-side__leader" aria-hidden="true" />
                <span class="fl-side__cdesc">исходники и правки</span>
                <Icon name="ph:arrow-up-right-bold" class="fl-side__cext" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped>
/* ---- fractal glass hero background (ASCII is untouched) ---- */
.fractal {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* aurora glow — soft drifting primary-blue blobs that fade to transparent well
   before the edges, so the page background shows through continuously (no panel
   bg, no rectangular seam, nothing to mismatch during a theme switch). Primary
   only — no secondary tint. */
.fractal-color {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(38% 48% at 36% 40%,
      color-mix(in srgb, var(--primary) 50%, transparent),
      transparent 62%),
    radial-gradient(34% 44% at 66% 58%,
      color-mix(in srgb, var(--semi-primary) 40%, transparent),
      transparent 64%),
    radial-gradient(30% 40% at 54% 30%,
      color-mix(in srgb, var(--primary) 22%, transparent),
      transparent 60%);
  filter: blur(34px) saturate(var(--hero-glow-saturate, 1));
  opacity: var(--hero-glow-opacity, 0.8);
  will-change: transform;
  animation: hero-drift 14s ease-in-out infinite alternate;
}
@keyframes hero-drift {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1);    }
  50%  { transform: translate3d( 2%,  1%, 0) scale(1.08); }
  100% { transform: translate3d( 1%, -2%, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .fractal-color { animation: none; }
}

/* ---------- ASCII wordmark + cursor spotlight ---------- */
.ascii-stack {
  display: grid;
}

.ascii {
  grid-area: 1 / 1;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;

  font-size: clamp(7px, 1.5vw, 1rem);
  line-height: 1.25;
  white-space: pre;
  color: var(--on-light);
}

/* measures one character cell; invisible, takes no space */
.ascii--probe {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
}

/* ink layer: the brush strokes, in the accent colour with a soft glow */
.ascii--ink {
  pointer-events: none;
  color: var(--hero-ink);
  text-shadow: 0 0 10px color-mix(in srgb, var(--hero-ink) 55%, transparent);
}

/* during the idle glitch the accent is a hint, not a glow */
.ascii--ink-soft {
  opacity: 0.7;
  text-shadow: 0 0 6px color-mix(in srgb, var(--hero-ink) 30%, transparent);
}

.fl-hero {
  user-select: none;
  -webkit-user-select: none;
  cursor: crosshair;
}

/* ---------- sidebar ---------- */
.fl-side {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* app.css sets `span { font-family: var(--font-main) }`: Cyrillic needs Inter */
.fl-side :deep(span) {
  font-family: inherit;
}

.fl-side__block {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  border-top: 1px solid color-mix(in srgb, var(--on-light) 22%, transparent);

  font-family: var(--font-sans);
}

.fl-side__label {
  display: flex;
  align-items: center;
  gap: 0.45rem;

  font-size: 10px;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--gray);
}

.fl-side__title {
  margin: 0.6rem 0 1.25rem;

  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--on-light);
}

.fl-side__big {
  margin-top: 0.75rem;

  font-family: var(--font-main);
  font-size: 3rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  color: var(--on-light);
}

.fl-side .fl-side__big-of {
  font-family: var(--font-main);
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  color: var(--gray);
}

.fl-side__caption {
  margin-top: 0.4rem;
  font-size: 12px;
  color: var(--gray);
}

.fl-side__progress {
  position: relative;
  height: 2px;
  margin-top: 1rem;
  background-color: color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-side__progress span {
  position: absolute;
  inset: 0;
  background-color: var(--on-light);
  transform: scaleX(var(--pct, 0));
  transform-origin: left;
}

.fl-side__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.fl-side__more {
  font-size: 12px;
  color: var(--gray);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, var(--on-light) 30%, transparent);
}

.fl-side__more:hover {
  color: var(--on-light);
}

.fl-side__board {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

/* ledger rows: rank · initials · name · count, hairlines between */
.fl-side__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 8%, transparent);
}

.fl-side__row:last-child {
  border-bottom: 0;
}

.fl-side .fl-side__rank {
  width: 1.5em;
  font-family: var(--font-main);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-side__avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;

  font-size: 11px;
  font-weight: 700;
  color: var(--on-dark);
  background-color: var(--on-light);
}

.fl-side__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 14px;
  font-weight: 500;
  color: var(--on-light);
}

.fl-side .fl-side__count {
  font-family: var(--font-main);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-side__note {
  margin-top: 0.75rem;
  font-size: 13px;
  line-height: 1.5;
  color: var(--gray);
}

.fl-side__community {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.fl-side__crow {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.55rem 0;

  font-size: 14px;
  text-decoration: none;
  color: color-mix(in srgb, var(--on-light) 80%, transparent);
}

.fl-side__crow:hover {
  color: var(--on-light);
}

.fl-side__cicon {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  align-self: center;
}

.fl-side__cname {
  font-weight: 500;
}

/* отточие, as in the map: a solid line sweeps over it on hover */
.fl-side__leader {
  position: relative;
  flex: 1;
  min-width: 1rem;
  height: 1px;
  align-self: flex-end;
  margin-bottom: 0.5em;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--on-light) 28%, transparent) 1px, transparent 1px);
  background-size: 4px 1px;
  background-repeat: repeat-x;
}

.fl-side__leader::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--on-light);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-side__crow:hover .fl-side__leader::after {
  transform: scaleX(1);
}

.fl-side__cdesc {
  font-size: 12px;
  color: var(--gray);
  white-space: nowrap;
}

.fl-side__cext {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  align-self: center;
  opacity: 0.6;
}

.fl-side__crow:hover .fl-side__cext {
  opacity: 1;
  transform: translate(2px, -2px);
}

.fl-side :is(a, button):focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-side__crow,
  .fl-side__more {
    transition: color 0.2s ease;
  }

  .fl-side__leader::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-side__cext {
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-side__progress span {
    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  }
}
</style>
