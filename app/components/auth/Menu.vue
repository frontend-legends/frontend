<script setup lang="ts">
import PATHS from '~/const/paths';
import LINKS from '~/const/links';
import { useAuthStore } from '~/store/auth.store';

const { switchMode, isDark } = useDarkMode();
const { signOut } = useSignOut();

const authStore = useAuthStore();
const isAuth = computed(() => authStore.getAuth);

async function signOutFn() {
  signOut();
  await navigateTo({ path: PATHS.home });
}
</script>
<template>
  <div class="fixed top-[48px] left-0 right-0 bottom-0 bg-op-80 p-8 backdrop-blur-md z-50 lg:hidden">

    <div class="flex flex-col mt-8 space-y-4">
      <div class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        @click="switchMode">
        <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />
        <span>switch theme</span>
      </div>

      <NuxtLink
        class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        :href="LINKS.github">
        <Icon name="ph:github-logo-bold" />
        <span>github</span>
      </NuxtLink>

      <NuxtLink
        class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        :href="LINKS.telegram">
        <Icon name="ph:paper-plane-tilt-bold" />
        <span>telegram</span>
      </NuxtLink>

      <NuxtLink v-if="!isAuth"
        class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        :to="PATHS.signin">
        <Icon name="ph:arrow-right-bold" />
        <span>sign in</span>
      </NuxtLink>

      <div v-else
        class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        @click="signOutFn">
        <Icon name="ph:sign-out-bold" />
        <span>sign out</span>
      </div>
    </div>
  </div>
</template>
<style scoped></style>