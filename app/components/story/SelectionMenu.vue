<script setup lang="ts">
// Плавающая панель над выделенным текстом статьи: копировать,
// спросить Claude / ChatGPT про фрагмент, сообщить об ошибке с цитатой.
// Только для устройств с мышью: на тач-экранах своё системное меню выделения.
import type { Ref } from "vue";

const page = inject<Ref<{ stem?: string; order?: number; title?: string; path?: string } | null> | null>("contentPage", null);

const REPO = "https://github.com/frontend-legends/content";
const MAX_QUOTE = 1200;

const visible = ref(false);
const text = ref("");
const pos = ref({ x: 0, y: 0, below: false });
const done = ref<"" | "copy">("");
let doneTimer: ReturnType<typeof setTimeout> | undefined;

const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function update() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return hide();
  const range = sel.getRangeAt(0);
  const prose = document.querySelector(".prose");
  const node = range.commonAncestorContainer;
  const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
  // only inside the article text, not in code blocks or our own UI
  if (!prose || !el || !prose.contains(el) || el.closest("pre, .fl-code, .fl-sel")) return hide();
  const t = sel.toString().replace(/\s+/g, " ").trim();
  if (t.length < 2) return hide();

  const r = range.getBoundingClientRect();
  if (!r.width && !r.height) return hide();
  const below = r.top < 110; // no room above (sticky header) → show under the selection
  const half = 110;
  pos.value = {
    x: Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8),
    y: below ? r.bottom + 10 : r.top - 10,
    below,
  };
  text.value = t;
  visible.value = true;
}

function hide() {
  visible.value = false;
  done.value = "";
}

let raf = 0;
const schedule = () => {
  if (!isFinePointer()) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(update);
};
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") hide();
};

onMounted(() => {
  document.addEventListener("selectionchange", schedule);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("selectionchange", schedule);
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.removeEventListener("keydown", onKey);
  cancelAnimationFrame(raf);
});

function flash(kind: "copy") {
  done.value = kind;
  clearTimeout(doneTimer);
  doneTimer = setTimeout(() => (done.value = ""), 1400);
}

const pageUrl = () => window.location.href.split("#")[0];
const quote = () => (text.value.length > MAX_QUOTE ? text.value.slice(0, MAX_QUOTE) + "…" : text.value);

async function copyText() {
  await navigator.clipboard.writeText(text.value);
  flash("copy");
}

function ask(base: string) {
  const q = `Объясни этот фрагмент из Frontend Legends (${pageUrl()}) и что про это могут спросить на собеседовании:\n\n«${quote()}»`;
  window.open(`${base}${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer");
}

function report() {
  const p = page?.value;
  const title = p ? `[${Number(p.order).toFixed(2)}] ${p.title}: ` : "Ошибка в тексте: ";
  const body = `Страница: ${pageUrl()}\nФайл: ${p?.stem ?? ""}.md\n\nФрагмент:\n> ${quote().replace(/\n/g, "\n> ")}\n\nЧто не так:\n\nКак должно быть:\n`;
  window.open(`${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fl-sel">
      <div v-if="visible" class="fl-sel bg-on-light text-on-dark" :class="{ 'is-below': pos.below }"
        :style="{ left: `${pos.x}px`, top: `${pos.y}px` }" role="toolbar" aria-label="Действия с выделенным текстом"
        @mousedown.prevent>
        <button type="button" class="fl-sel__btn" :aria-label="done === 'copy' ? 'Скопировано' : 'Копировать'"
          @click="copyText">
          <Icon :name="done === 'copy' ? 'ph:check-bold' : 'ph:copy-bold'" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">{{ done === 'copy' ? 'скопировано' : 'копировать' }}</q-tooltip>
        </button>
        <button type="button" class="fl-sel__btn" aria-label="Спросить Claude"
          @click="ask('https://claude.ai/new?q=')">
          <Icon name="simple-icons:anthropic" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">спросить claude</q-tooltip>
        </button>
        <button type="button" class="fl-sel__btn" aria-label="Спросить ChatGPT"
          @click="ask('https://chatgpt.com/?q=')">
          <Icon name="simple-icons:openai" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">спросить chatgpt</q-tooltip>
        </button>
        <button type="button" class="fl-sel__btn" aria-label="Сообщить об ошибке"
          @click="report">
          <Icon name="ph:flag-bold" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">сообщить об ошибке</q-tooltip>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fl-sel {
  position: fixed;
  z-index: 1100;
  display: flex;
  align-items: center;
  padding: 3px;
  transform: translate(-50%, -100%);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}

.fl-sel.is-below {
  transform: translate(-50%, 0);
}

.fl-sel__btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;

  color: inherit;
  opacity: 0.75;
  cursor: pointer;
}

.fl-sel__btn + .fl-sel__btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 1px;
  background-color: color-mix(in srgb, var(--on-dark) 18%, transparent);
}

.fl-sel__btn :deep(.iconify) {
  width: 15px;
  height: 15px;
}

.fl-sel__btn:hover {
  opacity: 1;
  background-color: color-mix(in srgb, var(--on-dark) 12%, transparent);
}

.fl-sel__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-sel-enter-active,
  .fl-sel-leave-active {
    transition: opacity 0.15s ease, margin 0.15s ease;
  }

  .fl-sel-enter-from,
  .fl-sel-leave-to {
    opacity: 0;
    margin-top: 4px;
  }

  .fl-sel__btn {
    transition: opacity 0.15s ease, background-color 0.15s ease;
  }
}
</style>
