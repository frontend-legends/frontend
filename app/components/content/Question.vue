<script setup lang="ts">
// MDC:
// ::question{level="senior"}
// Текст вопроса
// #mid
// Ответ, которого достаточно на mid
// #senior
// Что добавляет senior: механизм, trade-offs, грабли
// #followups
// - уточняющий вопрос → короткий ответ
// ::
//
// Ответ свёрнут: сначала ответь сам, потом сверься.
// level не отображается — пригодится для фильтров/режима карточек.
// Соседние вопросы складываются в один список: общие волосяные линии, без коробок.
const props = withDefaults(defineProps<{ level?: "mid" | "senior" }>(), {
  level: "mid",
});

const slots = useSlots();
</script>

<template>
  <details class="fl-q" :data-level="props.level">
    <summary class="fl-q__summary">
      <span class="fl-q__text"><slot mdc-unwrap="p" /></span>
      <span class="fl-q__icon" aria-hidden="true" />
    </summary>

    <div class="fl-q__answer">
      <div v-if="slots.mid" class="fl-q__part">
        <div class="fl-label">ответ на mid</div>
        <slot name="mid" />
      </div>
      <div v-if="slots.senior" class="fl-q__part fl-q__part--senior">
        <div class="fl-label">что добавит senior</div>
        <slot name="senior" />
      </div>
      <div v-if="slots.followups" class="fl-q__part">
        <div class="fl-label">уточняющие вопросы</div>
        <slot name="followups" />
      </div>
    </div>
  </details>
</template>

<style scoped>
.fl-q {
  position: relative;
  margin: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 14%, transparent);
}

/* hover: a solid line sweeps over the hairline from left to right */
.fl-q::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: var(--on-light);
  transform: scaleX(0);
  transform-origin: left;
  pointer-events: none;
}

.fl-q:hover::after {
  transform: scaleX(1);
}

/* first question of a run opens the list with its own hairline */
:not(.fl-q) + .fl-q {
  margin-top: 1.75rem;
  border-top: 1px solid color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-q:not(:has(+ .fl-q)) {
  margin-bottom: 1.75rem;
}

.fl-q__summary {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.15rem 0;

  cursor: pointer;
  list-style: none;
  user-select: none;
}

.fl-q__summary::-webkit-details-marker {
  display: none;
}

.fl-q__summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.fl-q__text {
  flex: 1;

  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.45;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--on-light) 82%, transparent);
}

.fl-q__summary:hover .fl-q__text,
.fl-q[open] .fl-q__text {
  color: var(--on-light);
}

/* plus → cross: two 1.5px strokes, rotated on open */
.fl-q__icon {
  position: relative;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 0.3rem;
  color: var(--on-light);
}

.fl-q__icon::before,
.fl-q__icon::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  margin-top: -0.75px;
  background-color: currentColor;
}

.fl-q__icon::after {
  transform: rotate(90deg);
}

.fl-q[open] .fl-q__icon {
  transform: rotate(45deg);
}

.fl-q__answer {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0 0 1.5rem;
}

.fl-q__part--senior {
  padding-left: 1rem;
  border-left: 2px solid var(--on-light);
}

.fl-q__part :deep(p) {
  margin: 0.35rem 0 0;
}

.fl-q__part :deep(ul) {
  margin: 0.35rem 0 0;
  padding-left: 1.1rem;
}

.fl-q__part :deep(li) {
  margin: 0.3rem 0;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-q::after {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .fl-q__icon {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .fl-q::details-content {
    transition:
      block-size 0.45s cubic-bezier(0.65, 0, 0.35, 1),
      opacity 0.3s ease,
      content-visibility 0.45s allow-discrete;
  }
}

/* smooth open AND close: the details box animates its own height (progressive enhancement) */
.fl-q {
  interpolate-size: allow-keywords;
}

.fl-q::details-content {
  block-size: 0;
  overflow: hidden;
  opacity: 0;
}

.fl-q[open]::details-content {
  block-size: auto;
  opacity: 1;
}

/* measure applies to prose, code keeps the full column */
.fl-q__answer :deep(p),
.fl-q__answer :deep(ul) {
  max-width: 64ch;
}
</style>
