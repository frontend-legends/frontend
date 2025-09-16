<script setup lang="ts">
import PATHS from '~/const/paths';
import { useSignOut } from '@nhost/vue';
import LINKS from '~/const/links';
import useScrollPage from "~/composables/usePageProgress";

const { scrollProgress } = useScrollPage();
const { switchMode, isDark } = useDarkMode();
const { error, isSuccess, signOut } = useSignOut();

const route = useRoute();

const chapter = computed(() => route.params.chapter as string);
const story = computed(() => route.params?.story as string | undefined);

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
};
</script>
<template>
  <nav
    class="flex no-wrap items-center w-full h-full justify-between max-width border-x border-semi-gray mx-auto bg-op-60">
    <div class="flex items-center justify-between flex-1">
      <div class="flex items-center">
        <NuxtLink :to="PATHS.home"
          class="relative border-right border-semi-gray flex items-center justify-center no-underline min-w-[60px] gap-x-2 px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
          <Icon name="ph:lightning-bold" />
          <h1 class="text-sm font-semibold">frontend legends</h1>

          <div
            class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
            :class="{ 'w-full bg-on-light!': route.name === 'home' }" />
        </NuxtLink>
        <div v-if="route.name === 'chapter' || route.name === 'story'" class="s:hidden lg:flex ml-4">
          <q-breadcrumbs active-color="gray" gutter="sm" class="text-xs font-main lowercase" separator-color="gray"
            separator="-">
            <!-- <q-breadcrumbs-el label="home" to="/"
              class="underline underline-transparent transition hover:text-on-light hover:underline-primary" /> -->
            <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`"
              class="underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`"
              class="underline underline-transparent transition hover:text-on-light hover:underline-primary" />
          </q-breadcrumbs>
        </div>
      </div>
      <div class="mr-4">
        <span class="text-xs">{{ Number(scrollProgress || 0).toFixed(2) }}%</span>
      </div>
    </div>
    <div class="flex items-center s:hidden lg:flex">
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="switchMode">
        <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </div>

      <NuxtLink :href="LINKS.github"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
        <Icon name="ph:github-logo-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </NuxtLink>

      <NuxtLink :href="LINKS.telegram"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
        <Icon name="ph:paper-plane-tilt-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </NuxtLink>

      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="signOutFn">
        <span>sign out</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'signup' }" />
      </div>
    </div>

    <div class="flex items-center lg:hidden">
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="">
        <Icon name="ph:list-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </div>
    </div>

    <!-- <div class="flex items-center gap-x-4">
      <q-btn @click="switchMode">
        <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" />
      </q-btn>
      <q-btn color="primary" @click="signOutFn">
        <span>Sign Out</span>
      </q-btn>
    </div> -->
  </nav>
</template>
<style scoped></style>
