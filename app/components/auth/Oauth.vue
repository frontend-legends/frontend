<script setup lang="ts">
// Вход через провайдеров: одна панель с волосяным швом — как «share | copy page» в шапке статьи.
const { signInWithGoogle, signInWithGitHub } = useOAuthSignIn();
</script>

<template>
  <div class="fl-oauth">
    <div class="fl-oauth__divider">
      <span>или через</span>
    </div>
    <div class="fl-oauth__bar">
      <button type="button" class="fl-oauth__btn" @click="signInWithGoogle()">
        <Icon name="ph:google-logo-bold" />
        <span>Google</span>
      </button>
      <button type="button" class="fl-oauth__btn" @click="signInWithGitHub()">
        <Icon name="ph:github-logo-bold" />
        <span>GitHub</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fl-oauth {
  margin-top: 1.75rem;
}

.fl-oauth__divider {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1rem;

  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--gray);
}

.fl-oauth__divider::before,
.fl-oauth__divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background-color: color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-oauth__bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid color-mix(in srgb, var(--on-light) 22%, transparent);
}

.fl-oauth__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  height: 46px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;

  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--on-light);
  cursor: pointer;
}

/* inset seam between the two halves */
.fl-oauth__btn + .fl-oauth__btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background-color: color-mix(in srgb, var(--on-light) 22%, transparent);
}

.fl-oauth__btn:hover {
  background-color: color-mix(in srgb, var(--on-light) 7%, transparent);
}

.fl-oauth__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: no-preference) {
  .fl-oauth__btn {
    transition: background-color 0.2s ease;
  }
}
</style>
