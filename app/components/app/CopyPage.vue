<template>
  <!-- one joined toolbar: share | copy page | more — shared tint, hairline seams -->
  <div v-if="rawUrl" class="fl-actions ml-auto mr-0">
    <!-- share page -->
    <q-btn flat text-color="on-dark" dense no-caps class="fl-actions__btn fl-actions__btn--icon"
      :aria-label="shareCopied ? 'Ссылка скопирована' : 'Поделиться страницей'"
      @click="sharePage">
      <span class="fl-swap" :class="{ 'is-on': shareCopied }" aria-hidden="true">
        <Icon name="ph:share-network-bold" class="fl-actions__icon fl-swap__a" />
        <Icon name="ph:check-bold" class="fl-actions__icon fl-swap__b text-positive" />
      </span>
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
        class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">
        {{ shareCopied ? "ссылка скопирована" : "поделиться" }}
      </q-tooltip>
    </q-btn>

    <!-- copy page markdown -->
    <q-btn flat text-color="on-dark" dense no-caps align="left" class="fl-actions__btn fl-actions__btn--text"
      @click="copyPage">
      <span class="fl-swap" :class="{ 'is-on': pageCopied }" aria-hidden="true">
        <Icon name="ph:copy-bold" class="fl-actions__icon fl-swap__a" />
        <Icon name="ph:check-bold" class="fl-actions__icon fl-swap__b text-positive" />
      </span>
      <span>{{ pageCopied ? "скопировано" : "copy page" }}</span>
    </q-btn>

    <!-- options -->
    <q-btn flat text-color="on-dark" dense no-caps class="fl-actions__btn fl-actions__btn--icon fl-actions__more"
      :class="menuOpen && 'is-open'" aria-label="Опции копирования" :aria-expanded="menuOpen">
      <Icon name="ph:caret-down-bold" class="fl-actions__icon fl-actions__caret" />
      <q-menu v-model="menuOpen" anchor="bottom end" self="top end"
        class="bg-on-semi-dark text-on-light font-main text-xs border border-semi-gray rounded-none shadow-lg">
        <q-list dense class="min-w-[228px] py-0">
          <q-item clickable v-close-popup @click="copyMarkdownLink">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon :name="linkCopied ? 'ph:check-bold' : 'ph:link-simple-bold'" class="text-gray shrink-0" />
              <span>{{ linkCopied ? "ссылка скопирована" : "copy markdown link" }}</span>
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="rawUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="ph:file-text-bold" class="text-gray shrink-0" />view as markdown
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right-bold" class="text-gray" />
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="chatgptUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="simple-icons:openai" class="text-gray shrink-0" />open in chatgpt
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right-bold" class="text-gray" />
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="claudeUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="simple-icons:anthropic" class="text-gray shrink-0" />open in claude
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right-bold" class="text-gray" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useClipboard } from "@vueuse/core";

// Content mirrors github.com/frontend-legends/content on `main`.
const props = defineProps<{ page: { stem?: string; id?: string } | null }>();

const stem = computed(
  () => props.page?.stem ?? props.page?.id?.replace(/^content\//, "").replace(/\.md$/, "") ?? "",
);
const rawUrl = computed(() =>
  stem.value ? `https://raw.githubusercontent.com/frontend-legends/content/main/${stem.value}.md` : "",
);
const q = computed(() =>
  encodeURIComponent(`Read ${rawUrl.value} so I can ask you questions about this page.`),
);
const chatgptUrl = computed(() => `https://chatgpt.com/?q=${q.value}`);
const claudeUrl = computed(() => `https://claude.ai/new?q=${q.value}`);

const menuOpen = ref(false);

const { copy: copyText, copied: pageCopied } = useClipboard({ copiedDuring: 1800 });
const { copy: copyLinkText, copied: linkCopied } = useClipboard({ copiedDuring: 1800 });

// Copy full page markdown (GitHub raw); fall back to the URL if fetch is blocked.
async function copyPage() {
  if (!rawUrl.value) return;
  let text = rawUrl.value;
  try {
    const r = await fetch(rawUrl.value);
    if (r.ok) text = await r.text();
  } catch {
    /* keep URL */
  }
  copyText(text);
}
const copyMarkdownLink = () => rawUrl.value && copyLinkText(rawUrl.value);

// Share: native share sheet where available (mobile, Safari), otherwise copy the page URL.
const { copy: copyShareUrl, copied: shareCopied } = useClipboard({ copiedDuring: 1800 });
const { share: nativeShare, isSupported: canNativeShare } = useShare();

async function sharePage() {
  const url = window.location.href.split("#")[0];
  const title = document.title;
  if (canNativeShare.value) {
    try {
      await nativeShare({ title, url });
      return;
    } catch (e) {
      // user closed the sheet — nothing to do
      if ((e as DOMException)?.name === "AbortError") return;
    }
  }
  copyShareUrl(url);
}
</script>

<style scoped>
.fl-actions {
  display: inline-flex;
  align-items: stretch;
  height: 34px;
  background-color: color-mix(in srgb, var(--on-dark) 10%, transparent);
}

.fl-actions__btn {
  position: relative;
  min-height: 34px;
  height: 34px;
  padding: 0;
  border-radius: 0;

  font-family: var(--font-main);
  font-size: 12px;
  letter-spacing: -0.005em;
}

/* hairline seam between segments, inset so the bar reads as one piece */
.fl-actions__btn + .fl-actions__btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 1px;
  background-color: color-mix(in srgb, var(--on-dark) 22%, transparent);
  pointer-events: none;
}

.fl-actions__btn--icon {
  width: 34px;
}

.fl-actions__btn--text {
  padding: 0 0.85rem;
}

.fl-actions__btn--text :deep(.q-btn__content) {
  gap: 0.5rem;
  flex-wrap: nowrap;
}

/* quasar's own hover layer is replaced by a flat tint */
.fl-actions__btn :deep(.q-focus-helper) {
  display: none;
}

.fl-actions__btn:hover {
  background-color: color-mix(in srgb, var(--on-dark) 10%, transparent);
}

.fl-actions__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  z-index: 1;
}

.fl-actions__icon {
  width: 15px;
  height: 15px;
}

.fl-actions__caret {
  width: 13px;
  height: 13px;
}

.fl-actions__more.is-open .fl-actions__caret {
  transform: rotate(180deg);
}

/* icon ↔ check crossfade; both glyphs mount up front so the check never pops in empty */
.fl-swap {
  display: grid;
  place-items: center;
}

.fl-swap > :deep(*) {
  grid-area: 1 / 1;
}

.fl-swap :deep(.fl-swap__b),
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

  .fl-actions__btn {
    transition: background-color 0.2s ease;
  }

  .fl-actions__caret {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}
</style>
