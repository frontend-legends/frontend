<script setup lang="ts">
import PATHS from '~/const/paths';
import { useSignOut } from '@nhost/vue';

const { switchMode, isDark } = useDarkMode();
const { error, isSuccess, signOut } = useSignOut();

async function signOutFn() {
  await signOut();

  if (error.value) {
    console.log(
      error.value
        ? `sign-up error (${error.value?.status}): ${error.value?.message}`
        : `sign-up error`,
    );
  }

  if (isSuccess.value) {
    localStorage.clear();

    await navigateTo({ path: PATHS.signin });
  }
}
</script>
<template>
  <nav class="flex items-center w-full h-full justify-between max-width mx-auto px-8 bg-op-60">
    <div class="flex items-center gap-x-4">
      <NuxtLink to="/" class="no-underline">
        <h1 class="font-bold text-base text-on-light">Frontend Legends</h1>
      </NuxtLink>
    </div>
    <div class="flex items-center gap-x-4">
      <q-btn @click="switchMode">
        <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />
      </q-btn>
      <q-btn color="primary" @click="signOutFn">
        <span>Sign Out</span>
      </q-btn>
    </div>
  </nav>
</template>
<style scoped></style>
