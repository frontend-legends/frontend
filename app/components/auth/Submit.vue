<script setup lang="ts">
// Главная кнопка входа/регистрации: синяя CTA, стрелка без подложки (по умолчанию).
// variant="slab" — инвертированная плита с квадратной стрелкой, как «дальше» в конце статьи.
withDefaults(defineProps<{ loading?: boolean; disabled?: boolean; to?: string; variant?: "slab" | "primary" }>(), {
  variant: "primary",
});
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="fl-submit" :class="variant === 'primary' ? 'is-primary' : 'bg-on-light text-on-dark'">
    <span class="fl-submit__label"><slot /></span>
    <span class="fl-submit__tile" aria-hidden="true">
      <Icon name="ph:arrow-right-bold" class="fl-submit__arrow" />
    </span>
  </NuxtLink>
  <button v-else type="submit" class="fl-submit" :class="variant === 'primary' ? 'is-primary' : 'bg-on-light text-on-dark'"
    :disabled="disabled || loading" :aria-busy="loading">
    <span class="fl-submit__label"><slot /></span>
    <span class="fl-submit__tile" aria-hidden="true">
      <span v-if="loading" class="fl-submit__spinner" />
      <Icon v-else name="ph:arrow-right-bold" class="fl-submit__arrow" />
    </span>
  </button>
</template>

<style scoped>
.fl-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  padding: 0 9px 0 1.1rem;
  border: 0;
  border-radius: 0;

  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  cursor: pointer;
}

.fl-submit:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

/* while loading the button is disabled (no double submit) but must not look disabled;
   Quasar dims every [disabled] with `opacity: .6 !important`, so this has to beat it */
.fl-submit[aria-busy="true"] {
  cursor: progress !important;
  opacity: 1 !important;
}

.fl-submit:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.fl-submit__tile {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background-color: color-mix(in srgb, var(--on-dark) 12%, transparent);
}

.fl-submit:not(:disabled):hover .fl-submit__tile {
  background-color: color-mix(in srgb, var(--on-dark) 22%, transparent);
}

.fl-submit:not(:disabled):hover .fl-submit__arrow {
  transform: translateX(3px);
}

.fl-submit__spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid color-mix(in srgb, var(--on-dark) 30%, transparent);
  border-top-color: var(--on-dark);
  border-radius: 50%;
  animation: fl-submit-spin 0.7s linear infinite;
}

/* primary: solid site blue, the arrow sits bare next to the edge — no tile */
.fl-submit.is-primary {
  height: 48px;
  padding: 0 1.1rem;
  color: #fff;
  background-color: var(--primary);
}

.fl-submit.is-primary:not(:disabled):hover {
  background-color: var(--semi-primary);
}

.fl-submit.is-primary .fl-submit__tile,
.fl-submit.is-primary:not(:disabled):hover .fl-submit__tile {
  width: auto;
  height: auto;
  background: none;
}

/* on blue the spinner is white in both themes */
.fl-submit.is-primary .fl-submit__spinner {
  border-color: rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
}

.fl-submit.is-primary .fl-submit__arrow {
  width: 16px;
  height: 16px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-submit,
  .fl-submit__tile {
    transition: background-color 0.2s ease, opacity 0.2s ease;
  }

  .fl-submit__arrow {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}

@keyframes fl-submit-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
