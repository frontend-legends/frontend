<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "signup",
  path: PATHS.signup,
  layout: "auth",
});
</script>
<template>
  <div>
    <AuthSignUpForm />
  </div>
</template>
<style scoped></style>