<script setup lang="ts">

</script>
<template>
  <footer>
    <div class="flex items-center h-full justify-between max-width mx-auto px-8">
      <div class="flex flex-col">
        <NuxtLink to="/" class="text-inherit">
          <h4 class="text-base">Frontend Legends</h4>
        </NuxtLink>
        <p class="font-main op-60">Advanced frontend guidelines</p>
      </div>
    </div>
  </footer>
</template>
<style scoped>
footer {
  width: 100%;

  padding: 24px;
  color: var(--light);
  background-color: var(--dark);

  border-top: 1px solid var(--gray);
}
</style>
