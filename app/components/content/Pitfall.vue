<script setup lang="ts">
// MDC:
// ::pitfall{title="Короткое имя бага"}
// #symptom
// Что видно в проде
// #cause
// Почему так происходит
// #fix
// Как чинить (и как не надо)
// ::
//
// Редакционный минимализм: без подложки, рамки и линий —
// квадрат цвета warning перед заголовком — единственный акцент, строки как типографская таблица.
// Подписи «грабли» нет: её даёт заголовок секции, повтор не нужен.
defineProps<{ title?: string }>();
const slots = useSlots();
</script>

<template>
  <div class="fl-pit my-10" role="note" aria-label="Грабли в проде">
    <div class="fl-pit__head">
      <span class="fl-pit__mark" aria-hidden="true" />
      <div class="fl-pit__title">{{ title || "Грабли в проде" }}</div>
    </div>

    <dl class="fl-pit__rows">
      <div v-if="slots.symptom" class="fl-pit__row">
        <dt class="fl-label">симптом</dt>
        <dd><slot name="symptom" /></dd>
      </div>
      <div v-if="slots.cause" class="fl-pit__row">
        <dt class="fl-label">причина</dt>
        <dd><slot name="cause" /></dd>
      </div>
      <div v-if="slots.fix" class="fl-pit__row">
        <dt class="fl-label">как чинить</dt>
        <dd><slot name="fix" /></dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
/* title carries the warning square inline — the section heading already says "грабли" */
.fl-pit__head {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  padding-bottom: 0.5rem;
}

.fl-pit__mark {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background-color: var(--warning);
  transform: translateY(-0.15em);
}

.fl-pit__title {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.0625rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--on-light);
}

.fl-pit__rows {
  margin: 0;
}

.fl-pit__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.2rem;
  padding: 0.6rem 0;
}

.fl-pit__row dt,
.fl-pit__row dd {
  min-width: 0;
  margin: 0;
  padding: 0;
}

.fl-pit__row dt {
  padding-top: 0.3rem;
}

.fl-pit__row dd :deep(p) {
  margin: 0.15rem 0;
}

.fl-pit__row dd :deep(p:first-child) {
  margin-top: 0;
}

.fl-pit__row dd :deep(ul) {
  margin: 0.25rem 0;
  padding-left: 1.1rem;
}

.fl-pit__row dd :deep(pre) {
  margin: 0.75rem 0;
}

@media (min-width: 640px) {
  .fl-pit__row {
    grid-template-columns: 120px minmax(0, 1fr);
    column-gap: 1.5rem;
  }
}
</style>
