<script setup lang="ts">


</script>
<template>
  <nav class="flex items-center w-full h-full justify-between max-width mx-auto px-8 bg-op-60">
    <div class="flex items-center gap-x-4">
      <NuxtLink to="/" class="no-underline">
        <h1 class="font-bold text-base text-on-light">Frontend Legends</h1>
      </NuxtLink>
    </div>

    <div class="flex items-center gap-x-4">
      <q-btn @click="$q.dark.toggle()">
        <Icon name="ph:moon-bold" />
      </q-btn>

      <q-btn color="primary" to="/auth">
        <span>Join</span>
      </q-btn>
    </div>

  </nav>
</template>
<style scoped></style>
