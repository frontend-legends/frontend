<script setup lang="ts">
import PATHS from '~/const/paths';
import LINKS from '~/const/links';

const route = useRoute();
const { switchMode, isDark } = useDarkMode();
</script>
<template>
  <div class="fixed top-[48px] left-0 right-0 bottom-0 bg-op-80 p-8 backdrop-blur-md z-50 lg:hidden">

    <div class="flex flex-col mt-8 space-y-4">
      <div class="flex items-center gap-4 text-on-semi-dark bg-on-semi-light p-4 underline underline-on-dark rounded"
        @click="switchMode">
        <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />
        <span>switch theme</span>
      </div>

      <NuxtLink
        class="flex items-center gap-4 text-on-semi-dark bg-on-semi-light p-4 underline underline-on-dark rounded"
        :href="LINKS.github">
        <Icon name="ph:github-logo-bold" />
        <span>github</span>
      </NuxtLink>

      <NuxtLink
        class="flex items-center gap-4 text-on-semi-dark bg-on-semi-light p-4 underline underline-on-dark rounded"
        :href="LINKS.telegram">
        <Icon name="ph:paper-plane-tilt-bold" />
        <span>telegram</span>
      </NuxtLink>

      <NuxtLink
        class="flex items-center gap-4 text-on-semi-dark bg-on-semi-light p-4 underline underline-on-dark rounded"
        :to="PATHS.signin">
        <Icon name="ph:arrow-right-bold" />
        <span>sign-in</span>
      </NuxtLink>

      <NuxtLink
        class="flex items-center gap-4 text-on-semi-dark bg-on-semi-light p-4 underline underline-on-dark rounded"
        :to="PATHS.signup">
        <Icon name="ph:arrow-line-right-bold" />
        <span>sign-up</span>
      </NuxtLink>
    </div>
  </div>
</template>
<style scoped></style>