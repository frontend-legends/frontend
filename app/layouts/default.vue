<script setup lang="ts">
const { isMenuVisible } = useMenu();
const { user } = useCurrentUser();

// Update auth store when user data is loaded
watch(user, (newUser) => {
  if (newUser) {
    // User is already set in the auth store by useCurrentUser composable
  }
}, { immediate: true });
</script>
<template>
  <div>
    <header>
      <AppNav />
    </header>
    <Transition name="menu">
      <AppMenu v-if="isMenuVisible" />
    </Transition>
    <main>
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>