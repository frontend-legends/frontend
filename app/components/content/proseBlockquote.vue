<template>
  <!-- in this book `>` is an aside / cross-reference, not a quotation:
       a 2px rail, upright text, no quote marks, no box -->
  <blockquote class="fl-note">
    <slot />
  </blockquote>
</template>

<style scoped>
.fl-note {
  margin: 1.75rem 0;
  padding: 0.15rem 0 0.15rem 1.25rem;
  border-left: 2px solid var(--on-light);
  quotes: none;

  font-family: var(--font-sans);
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  color: var(--on-semi-light);
}

.fl-note :deep(p) {
  margin: 0.4rem 0;
  font-style: normal;
  color: inherit;
}

.fl-note :deep(p::before),
.fl-note :deep(p::after) {
  content: none;
}
</style>
