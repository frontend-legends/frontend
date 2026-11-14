<script setup lang="ts">
const { isMenuVisible } = useMenu();

// Loads the current user and populates the auth store as a side effect.
useCurrentUser();

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
