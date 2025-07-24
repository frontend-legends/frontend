<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "home",
  path: PATHS.home,
});
</script>
<template>
  <div>
    <HomeWelcome />
    <hr>
    <AppRoadmap />
  </div>
</template>
<style scoped></style>