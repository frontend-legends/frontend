<script setup lang="ts">
// Блок кода. Квадратная панель в языке сайта: сверху строка «язык · copy» (copy видна всегда),
// код — моноширинным шрифтом (JetBrains Mono, есть кириллица для комментариев), номера строк тонкие.
// Блоки `text` (схемы, логи, ошибки) выглядят так же, только без номеров строк и с переносом.
import { useClipboard } from "@vueuse/core";

const props = defineProps({
  code: { type: String, default: "" },
  language: { type: String, default: null },
  filename: { type: String, default: null },
  highlights: { type: Array as () => number[], default: () => [] },
  meta: { type: String, default: null },
  class: { type: String, default: null },
});

const isPlain = computed(() => !props.filename && (!props.language || props.language === "text"));
const LANG_NAMES: Record<string, string> = {
  js: "javascript", mjs: "javascript", cjs: "javascript", javascript: "javascript",
  ts: "typescript", typescript: "typescript", jsx: "react jsx", tsx: "react tsx",
  vue: "vue", html: "html", css: "css", scss: "scss", json: "json", bash: "shell", sh: "shell",
  shell: "shell", sql: "sql", yaml: "yaml", yml: "yaml", diff: "diff", md: "markdown",
};
const label = computed(() => props.filename || LANG_NAMES[String(props.language)] || props.language || "text");

const { copy, copied: isCopied, isSupported } = useClipboard({ source: () => props.code, copiedDuring: 1600 });
const copyCode = () => copy(props.code);
const menuOpen = ref(false);

// «открыть в…»: TS Playground for JS/TS (raw code via #src=, no lz-string needed),
// and asking Claude / ChatGPT about this snippet, like the page-level copy menu
const JS_LANGS = ["js", "javascript", "mjs", "cjs", "ts", "typescript"];
const canPlayground = computed(() => JS_LANGS.includes(String(props.language)));
const playgroundUrl = computed(() => {
  const isJs = ["js", "javascript", "mjs", "cjs"].includes(String(props.language));
  return `https://www.typescriptlang.org/play${isJs ? "?filetype=js" : ""}#src=${encodeURIComponent(props.code)}`;
});

const MAX_PROMPT_CODE = 6000; // keep the GET url sane
function askUrl(base: string) {
  const code = props.code.length > MAX_PROMPT_CODE ? props.code.slice(0, MAX_PROMPT_CODE) + "\n// …" : props.code;
  const page = import.meta.client ? window.location.href.split("#")[0] : "";
  const q = `Объясни этот код из Frontend Legends (${page}). Что он делает и что спросят про него на собеседовании?\n\n\`\`\`${props.language || ""}\n${code}\n\`\`\``;
  return `${base}${encodeURIComponent(q)}`;
}
const openAsk = (base: string) => window.open(askUrl(base), "_blank", "noopener,noreferrer");
</script>

<template>
  <div class="fl-code" :class="{ 'is-plain': isPlain }">
    <!-- language as an editor-style tab sitting on the panel's top-left edge -->
    <span class="fl-code__tab">{{ label }}</span>

    <div class="fl-code__panel">
      <div class="fl-code__tools" :class="{ 'is-open': menuOpen }">
        <button v-if="isSupported" type="button" class="fl-code__tool" :aria-label="isCopied ? 'Скопировано' : 'Скопировать код'"
          @click="copyCode">
          <!-- both glyphs mount up front (the check is fetched with the page, not on click) and crossfade -->
          <span class="fl-swap" :class="{ 'is-on': isCopied }" aria-hidden="true">
            <Icon name="ph:copy-bold" class="fl-swap__a" />
            <Icon name="ph:check-bold" class="fl-swap__b" />
          </span>
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">
            {{ isCopied ? "скопировано" : "скопировать" }}
          </q-tooltip>
        </button>

        <button v-if="!isPlain" type="button" class="fl-code__tool" aria-label="Открыть код в…"
          :aria-expanded="menuOpen">
          <Icon name="ph:caret-down-bold" aria-hidden="true" />
          <q-menu v-model="menuOpen" anchor="bottom end" self="top end"
            class="bg-on-semi-dark text-on-light font-main text-xs border border-semi-gray rounded-none shadow-lg">
            <q-list dense class="min-w-[230px] py-0">
              <template v-if="canPlayground">
                <q-item clickable v-close-popup tag="a" :href="playgroundUrl" target="_blank" rel="noopener noreferrer">
                  <q-item-section class="flex-row items-center !justify-start gap-2.5">
                    <Icon name="simple-icons:typescript" class="text-gray shrink-0" />open in ts playground
                  </q-item-section>
                  <q-item-section side><Icon name="ph:arrow-up-right-bold" class="text-gray" /></q-item-section>
                </q-item>
                <q-separator class="bg-semi-gray" />
              </template>
              <q-item clickable v-close-popup @click="openAsk('https://claude.ai/new?q=')">
                <q-item-section class="flex-row items-center !justify-start gap-2.5">
                  <Icon name="simple-icons:anthropic" class="text-gray shrink-0" />ask claude about this code
                </q-item-section>
                <q-item-section side><Icon name="ph:arrow-up-right-bold" class="text-gray" /></q-item-section>
              </q-item>
              <q-separator class="bg-semi-gray" />
              <q-item clickable v-close-popup @click="openAsk('https://chatgpt.com/?q=')">
                <q-item-section class="flex-row items-center !justify-start gap-2.5">
                  <Icon name="simple-icons:openai" class="text-gray shrink-0" />ask chatgpt about this code
                </q-item-section>
                <q-item-section side><Icon name="ph:arrow-up-right-bold" class="text-gray" /></q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
      </div>

      <pre class="fl-code__pre" :class="$props.class"><slot /></pre>
    </div>
  </div>
</template>

<style scoped>
.fl-code {
  margin: 1.5rem 0;
}

.fl-code__panel {
  position: relative;
  background-color: color-mix(in srgb, var(--on-light) 5%, var(--on-dark));
}

/* editor-style tab: same fill as the panel, flush with its left edge */
.fl-code .fl-code__tab {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 0.85rem;
  background-color: color-mix(in srgb, var(--on-light) 5%, var(--on-dark));

  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  color: var(--gray);
}

/* tools float in the panel's top-right corner. On hover-capable devices they appear with the
   pointer (or keyboard focus, or while the menu is open); on touch they stay visible. */
.fl-code__tools {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: flex;
  align-items: center;
}

@media (hover: hover) {
  .fl-code__tools {
    opacity: 0;
  }

  .fl-code:hover .fl-code__tools,
  .fl-code__tools:focus-within,
  .fl-code__tools.is-open {
    opacity: 1;
  }
}

.fl-code__tool {
  position: relative;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;

  color: var(--gray);
  cursor: pointer;
}

.fl-code__tool :deep(.iconify) {
  width: 15px;
  height: 15px;
}

.fl-code__tool:hover,
.fl-code__tool[aria-expanded="true"] {
  color: var(--on-light);
  background-color: color-mix(in srgb, var(--on-light) 8%, transparent);
}

.fl-code__tool:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.fl-code__pre {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 1.1rem 1.25rem 1.1rem;
  overflow-x: auto;
  border-radius: 0;
  background: transparent !important; /* shiki paints its own theme background */

  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
}

.fl-code__pre :deep(code),
.fl-code__pre :deep(span) {
  font-family: var(--font-mono);
  font-size: 13px;
}

.fl-code__pre :deep(code .line) {
  display: block;
}

/* padding-right у scroll-контейнера не входит в прокручиваемую область — длинная строка упирается
   в край. Поэтому отступ справа даёт сам code: он растягивается по самой длинной строке. */
.fl-code:not(.is-plain) .fl-code__pre {
  padding-right: 0;
}

.fl-code:not(.is-plain) .fl-code__pre :deep(code) {
  display: block;
  width: max-content;
  min-width: 100%;
  padding-right: 1.25rem;
}

/* plain text blocks are mostly error messages, logs and diagrams: wrap them instead of scrolling */
.is-plain .fl-code__pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.is-plain .fl-code__pre :deep(code) {
  white-space: inherit;
}

/* copy ↔ check crossfade */
.fl-swap {
  display: grid;
  place-items: center;
}

.fl-swap > :deep(*) {
  grid-area: 1 / 1;
}

.fl-swap :deep(.fl-swap__b) {
  opacity: 0;
  transform: scale(0.6);
}

.fl-swap.is-on :deep(.fl-swap__a) {
  opacity: 0;
  transform: scale(0.6);
}

.fl-swap.is-on :deep(.fl-swap__b) {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-swap > :deep(*) {
    transition: opacity 0.18s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-code__tool,
  .fl-code__tools {
    transition: color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
  }
}
</style>
