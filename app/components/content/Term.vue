<script setup lang="ts">
// Термин с определением. Инлайн-компонент MDC:
//   :term[JavaScriptCore]{def="движок Safari и Bun от Apple"}
// Пунктирное подчёркивание; определение — тултипом при наведении, по фокусу с клавиатуры
// и по тапу на тач-устройствах. Для слов, которые читатель может не знать, а уходить гуглить
// из статьи не должен. Определение — одна короткая фраза, без ссылок и кода.
defineProps<{ def: string }>();

const open = ref(false);
const id = useId();
</script>

<template>
  <span class="fl-term" tabindex="0" role="button" :aria-describedby="`${id}-def`" :aria-expanded="open"
    @click="open = !open" @keydown.enter.prevent="open = !open" @keydown.esc="open = false">
    <slot mdc-unwrap="p" />
    <q-tooltip v-model="open" anchor="top middle" self="bottom middle" :offset="[0, 8]" max-width="320px"
      class="fl-term__tip !bg-on-semi-dark !text-on-light border border-solid border-semi-gray !rounded-none">
      <span :id="`${id}-def`">{{ def }}</span>
    </q-tooltip>
  </span>
</template>

<style scoped>
.fl-term {
  font: inherit; /* app.css puts Space Grotesk on every span */
  cursor: help;
  text-decoration: underline dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  text-decoration-color: color-mix(in srgb, currentColor 55%, transparent);
}

.fl-term:hover,
.fl-term:focus-visible,
.fl-term[aria-expanded="true"] {
  text-decoration-color: currentColor;
}

.fl-term:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-term {
    transition: text-decoration-color 0.2s ease;
  }
}
</style>

<style>
/* the tooltip is teleported to <body>, so it can't be styled from the scoped block */
.fl-term__tip,
.fl-term__tip span {
  font-family: var(--font-sans);
}

.fl-term__tip {
  padding: 0.5rem 0.65rem;
  font-size: 13px;
  line-height: 1.45;
}
</style>
