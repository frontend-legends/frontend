<script setup lang="ts">
// Поле формы в языке книги: подпись-микролейбл, волосяная линия, при фокусе
// поверх неё слева направо прочерчивается сплошная (как hover у ::question).
const model = defineModel<string>({ default: "" });

const props = defineProps<{
  label: string;
  type?: "text" | "email" | "password";
  autocomplete?: string;
  error?: string;
  hint?: string;
  autofocus?: boolean;
}>();

const id = useId();
const reveal = ref(false);
const inputType = computed(() => (props.type === "password" && reveal.value ? "text" : (props.type ?? "text")));
const describedBy = computed(() => (props.error || props.hint ? `${id}-msg` : undefined));
</script>

<template>
  <div class="fl-field" :class="{ 'has-error': !!error }">
    <label :for="id" class="fl-field__label">{{ label }}</label>

    <div class="fl-field__control">
      <input :id="id" v-model="model" :type="inputType" :autocomplete="autocomplete" :autofocus="autofocus"
        :aria-invalid="!!error" :aria-describedby="describedBy" class="fl-field__input" spellcheck="false" />

      <button v-if="type === 'password'" type="button" class="fl-field__reveal"
        :aria-label="reveal ? 'Скрыть пароль' : 'Показать пароль'" :aria-pressed="reveal" @click="reveal = !reveal">
        <Icon :name="reveal ? 'ph:eye-slash-bold' : 'ph:eye-bold'" />
      </button>

      <span class="fl-field__line" aria-hidden="true" />
    </div>

    <div v-if="error || hint" :id="`${id}-msg`" class="fl-field__msg" :role="error ? 'alert' : undefined">
      {{ error || hint }}
    </div>
  </div>
</template>

<style scoped>
.fl-field {
  display: flex;
  flex-direction: column;
}

.fl-field__label {
  font-family: var(--font-sans);
  font-size: 10px;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--gray);
}

.fl-field:focus-within .fl-field__label {
  color: var(--on-light);
}

.fl-field__control {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid color-mix(in srgb, var(--on-light) 22%, transparent);
}

.fl-field__input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 0;
  background: transparent;

  font-family: var(--font-sans);
  font-size: 16px; /* 16px: iOS не зумит поле при фокусе */
  letter-spacing: -0.005em;
  color: var(--on-light);
}

/* autofill must not paint a yellow/blue box over the minimal field */
.fl-field__input:-webkit-autofill {
  -webkit-text-fill-color: var(--on-light);
  transition: background-color 9999s ease 0s;
}

.fl-field__reveal {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-right: -8px;
  padding: 0;
  border: 0;
  background: none;

  color: var(--gray);
  cursor: pointer;
}

.fl-field__reveal:hover {
  color: var(--on-light);
}

.fl-field__reveal:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 0;
}

/* focus: solid line sweeps over the hairline from the left */
.fl-field__line {
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

.fl-field:focus-within .fl-field__line {
  transform: scaleX(1);
}

.fl-field__msg {
  min-height: 1.25rem;
  padding-top: 0.4rem;

  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 1.35;
  color: var(--gray);
}

.has-error .fl-field__line {
  transform: scaleX(1);
  background-color: var(--negative);
}

.has-error .fl-field__msg {
  color: var(--negative);
}

@media (prefers-reduced-motion: no-preference) {
  .fl-field__line {
    transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1), background-color 0.2s ease;
  }

  .fl-field__label,
  .fl-field__reveal {
    transition: color 0.2s ease;
  }
}
</style>
