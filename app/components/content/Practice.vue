<script setup lang="ts">
// MDC:
// ::practice{title="Что выведет?"}
// Условие + код
// #solution
// Решение с объяснением (свёрнуто)
// ::
//
// Тот же язык, что у ::pitfall и ::question: без коробки, квадрат-маркер у заголовка, волосяная линия
// с тумблером «показать решение +» справа.
withDefaults(defineProps<{ title?: string }>(), { title: "Задача" });
const slots = useSlots();
</script>

<template>
  <div class="fl-pr my-10">
    <div class="fl-pr__head">
      <span class="fl-pr__mark" aria-hidden="true" />
      <div class="fl-pr__title">{{ title }}</div>
    </div>

    <div class="fl-pr__task">
      <slot />
    </div>

    <details v-if="slots.solution" class="fl-pr__solution">
      <summary class="fl-pr__summary">
        <span class="fl-pr__rule" aria-hidden="true" />
        <span class="fl-pr__toggle">
          <span class="fl-pr__show">показать решение</span>
          <span class="fl-pr__hide">скрыть решение</span>
        </span>
        <span class="fl-pr__icon" aria-hidden="true" />
      </summary>
      <div class="fl-pr__answer">
        <slot name="solution" />
      </div>
    </details>
  </div>
</template>

<style scoped>
.fl-pr__head {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
}

.fl-pr__mark {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background-color: var(--on-light);
  transform: translateY(-0.15em);
}

.fl-pr__title {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.0625rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--on-light);
}

.fl-pr__task {
  margin-top: 0.5rem;
}

.fl-pr__task :deep(p) {
  margin: 0.5rem 0;
}

/* hairline + toggle on the right */
.fl-pr__summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.25rem 0;

  cursor: pointer;
  list-style: none;
  user-select: none;
}

.fl-pr__summary::-webkit-details-marker {
  display: none;
}

.fl-pr__summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.fl-pr__rule {
  position: relative;
  flex: 1;
  height: 1px;
  background-color: color-mix(in srgb, var(--on-light) 14%, transparent);
}

/* hover: a solid line sweeps over the hairline from left to right */
.fl-pr__rule::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--on-light);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-pr__summary:hover .fl-pr__rule::after {
  transform: scaleX(1);
}

.fl-pr__toggle {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: color-mix(in srgb, var(--on-light) 75%, transparent);
}

.fl-pr__summary:hover .fl-pr__toggle,
.fl-pr__solution[open] .fl-pr__toggle {
  color: var(--on-light);
}

.fl-pr__hide,
.fl-pr__solution[open] .fl-pr__show {
  display: none;
}

.fl-pr__solution[open] .fl-pr__hide {
  display: inline;
}

/* plus → cross, same as ::question */
.fl-pr__icon {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: var(--on-light);
}

.fl-pr__icon::before,
.fl-pr__icon::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  margin-top: -0.75px;
  background-color: currentColor;
}

.fl-pr__icon::after {
  transform: rotate(90deg);
}

.fl-pr__solution[open] .fl-pr__icon {
  transform: rotate(45deg);
}

/* open solution is bracketed: toggle hairline on top, closing hairline at the bottom */
.fl-pr__answer {
  padding: 0.75rem 0 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-pr__answer :deep(> :last-child) {
  margin-bottom: 0;
}

.fl-pr__answer :deep(p) {
  margin: 0.45rem 0;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-pr__rule::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-pr__icon {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-pr__solution::details-content {
    transition:
      block-size 0.45s cubic-bezier(0.65, 0, 0.35, 1),
      opacity 0.3s ease,
      content-visibility 0.45s allow-discrete;
  }
}

/* smooth open AND close: the details box animates its own height (progressive enhancement) */
.fl-pr__solution {
  interpolate-size: allow-keywords;
}

.fl-pr__solution::details-content {
  block-size: 0;
  overflow: hidden;
  opacity: 0;
}

.fl-pr__solution[open]::details-content {
  block-size: auto;
  opacity: 1;
}
/* measure applies to prose, code keeps the full column */
.fl-pr__answer :deep(p),
.fl-pr__answer :deep(ul) {
  max-width: 64ch;
}
</style>
