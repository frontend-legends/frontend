<script setup lang="ts"></script>
<template>
  <div>
    <header>
      <AuthNav />
    </header>
    <main class="flex flex-col items-center justify-center">
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>