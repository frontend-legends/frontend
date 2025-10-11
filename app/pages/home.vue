<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "home",
  path: PATHS.home,
});

useHead({
  title: "frontend legends"
})
</script>
<template>
  <div>
    <HomeWelcome />
    <hr class="h-px w-full text-semi-gray bg-semi-gray border-0 my-8" />
    <AppRoadmap />
  </div>
</template>
<style scoped></style>