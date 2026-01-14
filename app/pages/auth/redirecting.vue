<script setup lang="ts">
import PATHS from '~/const/paths';
import { useNotificationStore } from '~/store/notification.store';

definePageMeta({
  name: "redirecting",
  path: PATHS.redirecting,
  layout: "auth",
});

const route = useRoute();
const { add } = useNotificationStore();

onMounted(async () => {
  // Get token from OAuth callback URL
  const token = route.query.token;

  if (token && typeof token === 'string') {
    try {
      // Store the JWT token
      localStorage.setItem('auth_token', token);

      add({
        type: "positive",
        message: "Authentication successful! Redirecting to home page.",
      });

      await navigateTo(PATHS.home);
    } catch (err) {
      add({
        type: "negative",
        message: String(err) || "Something went wrong during authentication.",
      });
      await navigateTo(PATHS.signin);
    }
  } else {
    add({
      type: "negative",
      message: "You are not authenticated. Redirecting to sign-in page.",
    });
    await navigateTo(PATHS.signin);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h4>Redirecting...</h4>
    <p>Please wait while we redirect you to the appropriate page.</p>
  </div>
</template>
