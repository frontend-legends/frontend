<script setup lang="ts">
import PATHS from '~/const/paths';
import LINKS from '~/const/links';

const { switchMode, isDark } = useDarkMode();
const { signOut } = useSignOut();

const route = useRoute();

const chapter = computed(() => route.params.chapter as string);
const story = computed(() => route.params?.story as string | undefined);

async function signOutFn() {
  signOut();
  await navigateTo({ path: PATHS.signin });
};
</script>
<template>
  <div class="fixed top-[48px] left-0 right-0 bottom-0 bg-op-80 p-8 backdrop-blur-md z-50 lg:hidden">
    <div v-if="route.name === 'chapter' || route.name === 'story'">
      <q-breadcrumbs active-color="gray" gutter="sm" class="text-base lowercase" separator-color="gray" separator="-">
        <q-breadcrumbs-el label="home" to="/"
          class="underline underline-transparent transition hover:text-on-light hover:underline-primary" />
        <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`"
          class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
        <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`"
          class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
      </q-breadcrumbs>
    </div>
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

      <div class="flex items-center gap-4 text-light bg-primary px-6 py-4 underline underline-light font-500 rounded"
        @click="signOutFn">
        <Icon name="ph:sign-out-bold" />
        <span>sign out</span>
      </div>
    </div>
  </div>
</template>
<style scoped></style>