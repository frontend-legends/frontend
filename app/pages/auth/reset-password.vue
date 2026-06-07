<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "resetpassword",
  path: PATHS.resetpassword,
});
</script>
<template>
  <div>
    <AuthResetPasswordForm />
  </div>
</template>
<style scoped></style>