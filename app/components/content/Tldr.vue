<script setup lang="ts">
// MDC: ::tldr ... ::  — главное за 30 секунд в начале истории.
// Визуальный двойник шапки страницы (ProseH1): инвертированный блок + размытый водяной знак.
withDefaults(defineProps<{ title?: string }>(), {
  title: "главное за 30 секунд",
});
</script>

<template>
  <div class="fl-tldr fl-slab relative overflow-hidden my-10 bg-on-light text-on-dark">
    <span aria-hidden="true" class="fl-tldr__watermark">TL;DR</span>

    <div class="relative z-1 px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-9">
      <div class="fl-tldr__label"><Icon name="ph:lightning-fill" class="fl-tldr__zap" aria-hidden="true" />{{ title }}</div>
      <div class="fl-tldr__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fl-tldr__watermark {
  position: absolute;
  right: 0.18em;
  bottom: -0.14em;
  z-index: 0;

  font-family: var(--font-main);
  font-size: clamp(88px, 14vw, 148px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  white-space: nowrap;

  opacity: 0.08;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.fl-tldr__label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;

  font-family: var(--font-sans);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: -0.01em;

  opacity: 0.8;
}

.fl-tldr__zap {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.fl-tldr__body :deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 62ch;
}

.fl-tldr__body :deep(li) {
  position: relative;
  margin: 0;
  padding: 0 0 0 1.25rem;

  font-size: 0.9375rem;
  line-height: 1.55;
  color: color-mix(in srgb, var(--on-dark) 72%, transparent);
}

.fl-tldr__body :deep(li + li) {
  margin-top: 0.85rem;
}

/* square bullet — the same square language as the header buttons and the logo */
.fl-tldr__body :deep(li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62em;

  width: 6px;
  height: 6px;

  background-color: currentColor;
  opacity: 0.45;
}

.fl-tldr__body :deep(li)::marker {
  content: none;
}

.fl-tldr__body :deep(p) {
  margin: 0;
  color: inherit;
}

.fl-tldr__body :deep(strong) {
  color: var(--on-dark);
  font-weight: 600;
}

.fl-tldr__body :deep(code) {
  color: color-mix(in srgb, var(--on-dark) 82%, transparent);
  background-color: color-mix(in srgb, var(--on-dark) 9%, transparent);
}
</style>
