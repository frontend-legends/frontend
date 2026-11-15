<script setup lang="ts">
import type { Ref } from "vue";

// Provided by AppContent — gives us access to the page frontmatter (order + date).
const page = inject<
  Ref<{ date?: string | Date; order?: number } | null> | null
>("contentPage", null);

// order 0 is the root/landing page — it gets a tagline instead of a number watermark.
const isRoot = computed(() => page?.value?.order === 0);

const order = computed(() => {
  const o = page?.value?.order;
  return typeof o === "number" && o > 0 ? o.toFixed(2) : null;
});

const updated = computed(() => formatRuDate(page?.value?.date));
</script>

<template>
  <div class="relative overflow-hidden flex items-end justify-between gap-4 mb-8 min-h-[180px] p-6 fl-slab bg-on-light text-on-dark">
    <!-- oversized, soft-blurred section number as a watermark in the bottom-left.
         inherits currentColor (text-on-dark) so it flips with the theme. -->
    <span
      v-if="order || isRoot"
      aria-hidden="true"
      class="absolute left-0 bottom-[-40px] z-0 select-none pointer-events-none whitespace-nowrap font-main font-bold leading-none tracking-[-0.03em] text-[130px] md:text-[164px] op-8 blur-[3px]"
    >{{ isRoot ? "FL" : order }}</span>

    <!-- title block in the bottom-left, with the update date above it -->
    <div class="relative z-1 flex flex-col gap-0.5">
      <span
        v-if="isRoot"
        class="font-sans text-[10px] uppercase tracking-tight op-80"
      >справочник для фронтенд-собеседований</span>
      <!-- font-sans: Space Grotesk (font-main) has no Cyrillic -->
      <span
        v-if="updated && !isRoot"
        class="font-sans text-[10px] uppercase tracking-tight op-80"
      >обновлено {{ updated }}</span>

      <h1
        class="m-0 font-main font-bold uppercase leading-tight"
        :class="isRoot ? 'font-main! text-[1.75rem] md:text-[2.75rem] tracking-[-0.02em] leading-none mt-1' : 'tracking-wide text-sm md:text-base'"
      >
        <slot />
      </h1>
    </div>

    <!-- root: one square tile down to the map (same place and shape as «copy page» on articles) -->
    <div v-if="isRoot" class="fl-cover relative z-1 shrink-0">
      <a href="#map" class="fl-cover__jump" aria-label="К карте книги">
        <Icon name="ph:arrow-down-bold" />
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]"
            class="!bg-on-semi-dark !text-on-light border border-solid border-semi-gray font-sans text-xs !rounded-none px-2 py-1">к карте книги</q-tooltip>
      </a>
    </div>
    <AppCopyPage v-else :page="page" class="relative z-1 shrink-0" />
  </div>
</template>

<style scoped>
/* square tile, same as copy page / arrow tiles */
/* the tile lives inside .prose: reset its link line-height (28px) and underline so the icon centres */
.fl-cover__jump {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  text-decoration: none;
  width: 34px;
  height: 34px;
  color: inherit;
  background-color: color-mix(in srgb, var(--on-dark) 12%, transparent);
}

.fl-cover__jump:hover {
  background-color: color-mix(in srgb, var(--on-dark) 22%, transparent);
}

.fl-cover__jump :deep(.iconify) {
  width: 16px;
  height: 16px;
}

.fl-cover__jump:hover svg {
  transform: translateY(2px);
}

.fl-cover__jump:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-cover__jump {
    transition: background-color 0.2s ease;
  }

  .fl-cover__jump svg {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}
</style>
