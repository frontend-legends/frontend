<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "auth",
  path: PATHS.auth,
});
</script>
<template>
  <div>
    <AuthForm />
  </div>
</template>
<style scoped></style>