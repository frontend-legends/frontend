<script setup lang="ts">
const { isMenuVisible } = useMenu();
</script>
<template>
  <div>
    <header>
      <AuthNav />
    </header>
    <Transition name="menu">
      <AuthMenu v-if="isMenuVisible" />
    </Transition>
    <main class="flex flex-col items-center justify-center">
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>