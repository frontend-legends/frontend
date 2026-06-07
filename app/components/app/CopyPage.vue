<template>
  <div v-if="rawUrl" class="ml-auto mr-0">
    <!-- copy page markdown -->
    <q-btn flat text-color="on-dark" dense no-caps align="left"
      class="px-3 h-[34px] text-xs lowercase bg-[color-mix(in_srgb,var(--on-dark)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-dark)_22%,transparent)]"
      @click="copyPage">
      <Icon :name="pageCopied ? 'ph:check-bold' : 'ph:copy'" class="mr-2"
        :class="pageCopied ? 'text-positive' : 'text-on-dark'" />
      <span>{{ pageCopied ? "скопировано" : "copy page" }}</span>
    </q-btn>

    <!-- options -->
    <q-btn flat text-color="on-dark" dense no-caps
      class="w-[34px] h-[34px] border-l border-solid border-[color-mix(in_srgb,var(--on-dark)_25%,transparent)] text-xs bg-[color-mix(in_srgb,var(--on-dark)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-dark)_22%,transparent)]" aria-label="Опции копирования">
      <Icon name="ph:caret-down" />
      <q-menu anchor="bottom end" self="top end"
        class="bg-on-semi-dark text-on-light font-main text-xs border border-semi-gray rounded-none shadow-lg">
        <q-list dense class="min-w-[228px] py-0">
          <q-item clickable v-close-popup @click="copyMarkdownLink">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon :name="linkCopied ? 'ph:check-bold' : 'ph:link-simple'" class="text-gray shrink-0" />
              <span>{{ linkCopied ? "ссылка скопирована" : "copy markdown link" }}</span>
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="rawUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="ph:file-text" class="text-gray shrink-0" />view as markdown
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right" class="text-gray" />
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="chatgptUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="simple-icons:openai" class="text-gray shrink-0" />open in chatgpt
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right" class="text-gray" />
            </q-item-section>
          </q-item>
          <q-separator class="bg-semi-gray" />

          <q-item clickable v-close-popup tag="a" :href="claudeUrl" target="_blank" rel="noopener noreferrer">
            <q-item-section class="flex-row items-center !justify-start gap-2.5">
              <Icon name="simple-icons:anthropic" class="text-gray shrink-0" />open in claude
            </q-item-section>
            <q-item-section side>
              <Icon name="ph:arrow-up-right" class="text-gray" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
</script>
