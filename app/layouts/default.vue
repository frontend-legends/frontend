<script setup lang="ts">
import { useUserData } from '@nhost/vue';
import { useAuthStore } from '~/store/auth.store';
import type { IAuthStoreUser } from '~/types/user.type';

const user = useUserData();
const authStore = useAuthStore();

onMounted(async () => {
  // auth store
  authStore.setUser(user.value as IAuthStoreUser);
});
</script>
<template>
  <div>
    <header>
      <AppNav />
    </header>
    <main>
      <section>
        <slot />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
<style scoped></style>