<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "home",
  path: PATHS.home,
});

useHead({
  title: "Frontend Legends"
})
</script>
<template>
  <div>
    <HomeWelcome />
    <hr class="h-px w-full text-semi-gray bg-semi-gray border-0 my-12" id="map" />
    <AppRoadmap />
  </div>
</template>
<style scoped></style>