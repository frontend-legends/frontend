<script setup lang="ts">
// Layout всех /auth/* страниц. Плита-колода живёт здесь, а не в странице:
// при переключении «вход / регистрация» она не пересоздаётся, меняется только форма.
import PATHS from "~/const/paths";

const { isMenuVisible } = useMenu();
const route = useRoute();

// Loads the current user and populates the auth store as a side effect.
useCurrentUser();

const isTabs = computed(() => route.path === PATHS.signin || route.path === PATHS.signup);
</script>

<template>
  <div>
    <header>
      <AppNav />
    </header>
    <Transition name="menu">
      <AppMenu v-if="isMenuVisible" />
    </Transition>

    <main class="fl-auth-main">
      <!-- the frame continues the header's vertical hairlines down the page -->
      <div class="fl-auth">
        <AuthDeck class="fl-auth__deck" />

        <div class="fl-auth__panel">
          <!-- 48px row, aligned with the deck's bar: one horizontal line across the frame -->
          <div class="fl-auth__bar">
            <nav v-if="isTabs" class="fl-auth__tabs" aria-label="Вход или регистрация">
              <NuxtLink :to="PATHS.signin" class="fl-auth__tab" :class="{ 'is-active': route.path === PATHS.signin }"
                :aria-current="route.path === PATHS.signin ? 'page' : undefined">вход</NuxtLink>
              <NuxtLink :to="PATHS.signup" class="fl-auth__tab" :class="{ 'is-active': route.path === PATHS.signup }"
                :aria-current="route.path === PATHS.signup ? 'page' : undefined">регистрация</NuxtLink>
            </nav>
            <NuxtLink v-else :to="PATHS.signin" class="fl-auth__tab fl-auth__back">
              <Icon name="ph:arrow-left-bold" aria-hidden="true" />
              <span>ко входу</span>
            </NuxtLink>
          </div>

          <div class="fl-auth__body">
            <slot />
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
/* app.css sets `span, p { font-family: var(--font-main) }` globally; Space Grotesk has no
   Cyrillic, so inside auth every span/p inherits the block's font instead */
.fl-auth :deep(:is(span, p)) {
  font-family: inherit;
}

.fl-auth-main {
  /* header: 3px top offset + 48px + 1px border = 52px; the main already pads 48 */
  padding-bottom: 20px; /* fixed footer */
}

.fl-auth {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  max-width: var(--max-width);
  min-height: calc(100svh - 72px);
  margin: 4px auto 0;

  border-inline: 1px solid var(--semi-gray);
}

/* ---------- panel ---------- */
.fl-auth__panel {
  order: -1; /* phones: the form first, the deck below it */
  display: grid;
  grid-template-rows: 48px minmax(0, 1fr);
}

.fl-auth__bar {
  display: flex;
  border-bottom: 1px solid var(--semi-gray);
}

.fl-auth__tabs {
  display: flex;
}

/* tabs are header cells (AppNav): hairline seam, 3px bar resting on the line, 80% → 100% */
.fl-auth__tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  padding: 0 1.5rem;
  border-right: 1px solid var(--semi-gray);

  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: var(--on-light);
  opacity: 0.8;
}

.fl-auth__tab:hover,
.fl-auth__tab.is-active {
  opacity: 1;
}

/* anchored left like the header's bar: grows left → right on hover, shrinks back to the left on leave */
.fl-auth__tab::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.5px; /* same resting gap as the header bar (AppNav sits on a half pixel) */
  height: 3px;
  background-color: var(--on-semi-dark);
  transform: scaleX(0);
  transform-origin: left;
}

.fl-auth__tab:hover::after {
  transform: scaleX(1);
}

.fl-auth__tab.is-active::after {
  background-color: var(--on-light);
  transform: scaleX(1);
}

.fl-auth__tab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.fl-auth__back :deep(svg) {
  width: 13px;
  height: 13px;
}

.fl-auth__body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem 3rem;
}

.fl-auth__body > :deep(*) {
  width: min(400px, 100%);
}

@media (min-width: 1024px) {
  .fl-auth {
    grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
  }

  .fl-auth__panel {
    order: 0;
  }

  .fl-auth__body {
    padding: 3rem 3.5rem;
  }
}

/* short laptop screens (≤ 800px tall): tighter vertical rhythm so sign-up fits without scrolling */
@media (min-width: 1024px) and (max-height: 820px) {
  .fl-auth__body {
    padding-block: 1.75rem;
  }

  .fl-auth__body :deep(.fl-form) {
    gap: 0.6rem;
    margin-top: 1.5rem;
  }

  .fl-auth__body :deep(.fl-oauth) {
    margin-top: 1.25rem;
  }
}

/* one orchestrated entrance: the slab wipes in, the question sets itself, the form settles */
@media (prefers-reduced-motion: no-preference) {
  .fl-auth__deck {
    animation: fl-auth-wipe 0.9s cubic-bezier(0.77, 0, 0.175, 1) both;
  }

  .fl-auth__body {
    animation: fl-auth-settle 0.7s 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .fl-auth__tab {
    transition: opacity 0.2s ease;
  }

  /* same timing as the header: 0.3s, cubic-bezier(0.4, 0, 0.2, 1) */
  .fl-auth__tab::after {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes fl-auth-wipe {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes fl-auth-settle {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
