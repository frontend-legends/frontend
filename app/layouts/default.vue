<script setup lang="ts">
const { isMenuVisible } = useMenu();
const route = useRoute();

// Loads the current user and populates the auth store as a side effect.
useCurrentUser();

// Auth pages center their content (sign-in/up forms, etc.).
const isAuthRoute = computed(() => route.path.startsWith('/auth'));
</script>
<template>
  <div>
    <header>
      <AppNav />
    </header>
    <Transition name="menu">
      <AppMenu v-if="isMenuVisible" />
    </Transition>
    <main :class="{ 'flex flex-col items-center justify-center': isAuthRoute }">
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>
