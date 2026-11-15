<script setup lang="ts">
// Ссылка в тексте статьи. Внутренняя (тема книги) — фирменное синее подчёркивание; внешняя — серое
// и ↗ у последнего слова (на hover — цвета текста). Пока курсор над ссылкой, рядом с ним едет серый ярлык «куда ведёт»:
//   тема — номер и русский заголовок (и раздел, если ссылка на якорь);
//   внешний сайт — домен и путь; раздел этой же страницы — его заголовок.
// Только для мыши (hover + fine pointer); с клавиатуры ярлык встаёт под ссылкой.
// На телефоне ярлыка нет: тап сразу ведёт по ссылке.
const props = defineProps({
  href: { type: String, default: "" },
  target: { type: String, default: undefined, required: false },
});

const route = useRoute();
const { stories, chapters, isAuth, isCompleted } = useBookMap();

const isMail = computed(() => /^mailto:/i.test(props.href));
const isExternal = computed(() => /^(https?:)?\/\//i.test(props.href) || isMail.value);

function decode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

type Peek =
  | { kind: "story"; path: string; hash?: string; order: string; title: string; done: boolean }
  | { kind: "here"; section: string }
  | { kind: "ext"; host: string; path: string };

// where the link goes; null = nothing worth showing (unknown target)
const peek = computed<Peek | null>(() => {
  const href = props.href;
  if (!href) return null;

  if (isExternal.value) {
    if (isMail.value) return { kind: "ext", host: href.replace(/^mailto:/i, ""), path: "" };
    try {
      const u = new URL(href, "https://x.invalid");
      return { kind: "ext", host: u.hostname.replace(/^www\./, ""), path: decode(u.pathname + u.search + u.hash).replace(/\/$/, "") };
    } catch {
      return null;
    }
  }

  const [rawPath = "", rawHash = ""] = href.split("#");
  const hash = decode(rawHash) || undefined;

  // same page: only a jump to a real heading is worth a label
  if (!rawPath || rawPath.replace(/\/$/, "") === route.path.replace(/\/$/, "")) {
    const el = hash ? document.getElementById(hash) : null;
    const section = el && /^H[1-6]$/.test(el.tagName) ? el.textContent?.trim() : undefined;
    return section ? { kind: "here", section } : null;
  }

  const path = rawPath.replace(/^\/content/, "").replace(/\/$/, "");
  const story = stories.value.find((s) => s.path === path);
  const chapter = chapters.value.find((c) => c.path === (story ? `/${path.split("/")[1]}` : path));
  const target = story ?? chapter;
  if (!target) return null;

  return {
    kind: "story",
    path,
    hash,
    order: story ? Number(story.order).toFixed(2) : String(chapter!.order).padStart(2, "0"),
    title: target.title,
    done: !!story && isAuth.value && isCompleted(story.path),
  };
});

// the target page's own words: its Russian heading and the section's heading (fetched once, cached)
const page = ref<PagePeek>({});

function prefetch() {
  const p = peek.value;
  if (p?.kind !== "story") return Promise.resolve();
  return loadPagePeek(p.path, p.hash).then((r) => {
    page.value = r;
  });
}

// ---------- the label that follows the cursor ----------
const uid = useId();
const open = ref(false);
const pos = reactive({ x: 0, y: 0 });
const tipEl = ref<HTMLElement | null>(null);

const canHover = import.meta.client && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = import.meta.client && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// offset from the cursor tip; flips to the left of the cursor near the right edge
const OFF_X = 16;
const OFF_Y = 20;
let goal = { x: 0, y: 0 };
let raf = 0;
let showTimer: ReturnType<typeof setTimeout> | undefined;

function aim(clientX: number, clientY: number) {
  const w = tipEl.value?.offsetWidth ?? 240;
  const vw = document.documentElement.clientWidth;
  const x = clientX + OFF_X + w + 16 > vw ? clientX - OFF_X - w : clientX + OFF_X;
  goal = { x: Math.max(16, x), y: clientY + OFF_Y };
}

// eases toward the cursor: trails it a little instead of being glued to it
function tick() {
  const k = reduced ? 1 : 0.28;
  pos.x += (goal.x - pos.x) * k;
  pos.y += (goal.y - pos.y) * k;
  if (Math.abs(goal.x - pos.x) + Math.abs(goal.y - pos.y) > 0.3) raf = requestAnimationFrame(tick);
  else {
    pos.x = goal.x;
    pos.y = goal.y;
    raf = 0;
  }
}

function follow(e: PointerEvent) {
  if (!open.value) return;
  aim(e.clientX, e.clientY);
  if (!raf) raf = requestAnimationFrame(tick);
}

function show(e: PointerEvent) {
  if (!canHover || !peek.value) return;
  const { clientX, clientY } = e;
  const ready = prefetch();
  clearTimeout(showTimer);
  // a beat for the Russian heading to arrive (instant once cached), so the label never swaps its text
  showTimer = setTimeout(async () => {
    await Promise.race([ready, new Promise((r) => setTimeout(r, 200))]);
    open.value = true;
    await nextTick();
    aim(clientX, clientY);
    pos.x = goal.x;
    pos.y = goal.y;
  }, 80);
}

function hide() {
  clearTimeout(showTimer);
  cancelAnimationFrame(raf);
  raf = 0;
  open.value = false;
}

// keyboard: the label sits under the link's first line
async function onFocus(e: FocusEvent) {
  const el = e.currentTarget as HTMLElement;
  if (!peek.value || !el.matches(":focus-visible")) return;
  await prefetch();
  const r = el.getClientRects()[0];
  if (!r) return;
  open.value = true;
  await nextTick();
  aim(r.left - OFF_X, r.bottom - OFF_Y + 8);
  pos.x = goal.x;
  pos.y = goal.y;
}

// fixed to the viewport: a scroll would leave it hanging away from the link
useEventListener("scroll", () => open.value && hide(), { passive: true });
onBeforeUnmount(hide);
</script>

<template>
  <NuxtLink :href="props.href" :target="isExternal && !isMail ? (props.target ?? '_blank') : props.target"
    :rel="isExternal ? 'noopener noreferrer' : undefined" class="fl-a" :class="isExternal ? 'fl-a--ext' : 'fl-a--int'"
    :aria-describedby="open ? uid : undefined" @pointerenter="show" @pointermove="follow" @pointerleave="hide"
    @focus="onFocus" @blur="hide" @click="hide">
    <!-- the underline lives on the text only; the mark sits outside it, glued to the last word:
         word joiner + no-break space (no break opportunity), the arrow is a mask on that inline box -->
    <span class="fl-a__text"><slot /></span><span v-if="isExternal" class="fl-a__ext" aria-hidden="true">&#8288;&nbsp;</span><span
      v-if="isExternal && !isMail" class="sr-only"> (в новой вкладке)</span>

    <!-- inside the link so the component keeps one root; the label itself renders in <body> -->
    <Teleport to="body">
      <div v-if="open && peek" :id="uid" ref="tipEl" role="tooltip" class="fl-tip"
        :style="{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }">
        <span class="fl-tip__chip">
          <template v-if="peek.kind === 'story'">
            <Icon name="ph:arrow-right-bold" class="fl-tip__icon" aria-hidden="true" />
            <span class="fl-tip__num">{{ peek.order }}</span>
            <span class="fl-tip__main" lang="ru">{{ page.heading || peek.title }}</span>
            <span v-if="page.section" class="fl-tip__sub">/ {{ page.section }}</span>
            <Icon v-if="peek.done" name="ph:check-bold" class="fl-tip__done" aria-label="пройдено" />
          </template>

          <template v-else-if="peek.kind === 'here'">
            <Icon name="ph:arrow-down-bold" class="fl-tip__icon" aria-hidden="true" />
            <span class="fl-tip__main" lang="ru">{{ peek.section }}</span>
          </template>

          <template v-else>
            <Icon name="ph:arrow-up-right-bold" class="fl-tip__icon" aria-hidden="true" />
            <span class="fl-tip__main">{{ peek.host }}</span>
            <span v-if="peek.path" class="fl-tip__sub">{{ peek.path }}</span>
          </template>
        </span>
      </div>
    </Teleport>
  </NuxtLink>
</template>

<style scoped>
/* ---------- the link ---------- */
/* app.css: `span { font-family: var(--font-main) }` (no Cyrillic) — the link's spans keep the text's font */
.fl-a :deep(span) {
  font-family: inherit;
}

/* the underline moves from <a> to the text span, so the external mark stays clean */
.prose .fl-a {
  text-decoration: none;
}

.prose .fl-a__text {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  text-decoration-color: var(--primary);
}

.prose .fl-a--int:hover .fl-a__text {
  text-decoration-thickness: 2px;
}

/* out of the book: a quieter underline */
.prose .fl-a--ext .fl-a__text {
  text-decoration-color: color-mix(in srgb, var(--on-light) 30%, transparent);
}

.prose .fl-a--ext:hover .fl-a__text {
  text-decoration-color: currentColor;
}

/* ↗ set like a letter of the text: same size, on the line, never underlined; on hover only its colour changes.
   An inline box (not inline-block — that could wrap alone) painted with the UI's arrow icon. */
.prose .fl-a__ext {
  --arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath d='M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z'/%3E%3C/svg%3E");
  padding-right: 0.62em;

  background-color: color-mix(in srgb, var(--on-light) 55%, transparent);
  -webkit-mask: var(--arrow) no-repeat 100% 58% / 0.8em 0.8em;
  mask: var(--arrow) no-repeat 100% 58% / 0.8em 0.8em;
}

/* on hover the arrow takes the text's colour, like the link itself */
.prose .fl-a--ext:hover .fl-a__ext {
  background-color: var(--on-light);
}

@media (prefers-reduced-motion: no-preference) {
  .prose .fl-a__text {
    transition: text-decoration-color 0.2s ease;
  }

  .prose .fl-a__ext {
    transition: background-color 0.2s ease;
  }
}

/* ---------- the cursor label ---------- */
/* the wrapper only carries the position (set every frame); the chip inside does the entrance */
.fl-tip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  pointer-events: none;
  will-change: transform;
}

/* a grey glass chip: square like every surface of the site, a hairline, the page blurred behind */
.fl-tip__chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: min(380px, calc(100vw - 32px));
  height: 30px;
  padding: 0 0.7rem;

  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  color: var(--on-light);
  background-color: color-mix(in srgb, var(--on-semi-dark) 94%, transparent);
  border: 1px solid var(--semi-gray);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  transform-origin: 0 0;
  animation: fl-tip-in 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.fl-tip__chip :deep(span) {
  font-family: inherit;
}

.fl-tip__icon {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: var(--gray);
}

.fl-tip .fl-tip__num {
  flex-shrink: 0;
  font-family: var(--font-main);
  font-variant-numeric: tabular-nums;
  color: var(--gray);
}

.fl-tip__main {
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

/* the section or the path: gives way first when the label runs out of room */
.fl-tip__sub {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--gray);
}

.fl-tip__done {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: var(--positive);
}

@keyframes fl-tip-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fl-tip__chip {
    animation-name: fl-tip-fade;
  }
}

@keyframes fl-tip-fade {
  from {
    opacity: 0;
  }
}
</style>
