<script setup lang="ts">
const { isMenuVisible } = useMenu();
</script>
<template>
  <div>
    <header>
      <AuthNav />
    </header>
    <AuthMenu v-if="isMenuVisible" />
    <main class="flex flex-col items-center justify-center">
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>