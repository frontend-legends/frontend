<script setup lang="ts">
// Содержимое правой половины auth-layout: заголовок, подводка, форма, нижняя строка.
// Колода вопросов и вкладки живут в layouts/auth.vue.
defineProps<{ title: string }>();
</script>

<template>
  <div class="fl-panel">
    <h1 class="fl-panel__title">{{ title }}</h1>
    <div v-if="$slots.lead" class="fl-panel__lead"><slot name="lead" /></div>

    <slot />

    <div v-if="$slots.footer" class="fl-panel__footer"><slot name="footer" /></div>
  </div>
</template>

<style scoped>
.fl-panel {
  display: flex;
  flex-direction: column;
}

.fl-panel__title {
  margin: 0;

  font-family: var(--font-sans);
  font-weight: 700;
  font-size: clamp(1.75rem, 2.4vw, 2.25rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: var(--on-light);
}

.fl-panel__lead {
  margin-top: 0.75rem;
  max-width: 40ch;

  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  color: var(--gray);
}

.fl-panel__lead :deep(b) {
  font-weight: 600;
  color: var(--on-light);
}

.fl-panel__footer {
  margin-top: 2rem;

  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--gray);
}

.fl-panel__footer :deep(a),
.fl-panel__footer :deep(button) {
  padding: 0;
  border: 0;
  background: none;

  font: inherit;
  font-weight: 600;
  color: var(--on-light);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  cursor: pointer;
}

.fl-panel__footer :deep(:is(a, button):focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
</style>
