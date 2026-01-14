<script setup lang="ts">
import { useAuthStore } from '~/store/auth.store';

const authStore = useAuthStore();
const { isMenuVisible } = useMenu();
const { user } = useCurrentUser();

// Update auth store when user data is loaded
watch(user, (newUser) => {
  if (newUser) {
    // User is already set in the auth store by useCurrentUser composable
  }
}, { immediate: true });
</script>
<template>
  <div>
    <header>
      <AppNav />
    </header>
    <AppMenu v-if="isMenuVisible" />
    <main>
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>