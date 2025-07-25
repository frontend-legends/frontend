<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "signin",
  path: PATHS.signin,
  layout: "auth",
});
</script>
<template>
  <div>
    <AuthSignInForm />
  </div>
</template>
<style scoped></style>