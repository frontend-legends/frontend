<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "verifyemail",
  path: PATHS.verifyemail,
});
</script>
<template>
  <div>
    <AuthVerifyEmailForm />
  </div>
</template>
<style scoped></style>