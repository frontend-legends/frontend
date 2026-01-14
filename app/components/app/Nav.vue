<script setup lang="ts">
import PATHS from '~/const/paths';
import LINKS from '~/const/links';
import useScrollPage from "~/composables/usePageProgress";

const { toggleMenu } = useMenu();
const { scrollProgress } = useScrollPage();
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
  <nav
    class="flex no-wrap items-center w-full h-full justify-between max-width border-x border-semi-gray mx-auto bg-op-60">
    <div class="flex items-center justify-between flex-1">
      <div class="flex items-center">
        <NuxtLink :to="PATHS.home"
          class="relative border-right border-semi-gray flex items-center justify-center no-underline min-w-[60px] gap-x-2 px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
          <img src="/assets/logos/dark-on-light.svg" width="20" height="20" alt="FL" v-show="isDark" />
          <img src="/assets/logos/light-on-dark.svg" width="20" height="20" alt="FL" v-show="!isDark" />

          <h1 class="text-sm font-semibold">Frontend Legends</h1>

          <div
            class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
            :class="{ 'w-full bg-on-light!': route.name === 'home' }" />
        </NuxtLink>
        <div v-if="route.name === 'chapter' || route.name === 'story'" class="s:hidden lg:flex ml-4">
          <q-breadcrumbs active-color="gray" gutter="sm" class="text-xs lowercase" separator-color="gray" separator="-">
            <!-- <q-breadcrumbs-el label="home" to="/"
              class="underline underline-transparent transition hover:text-on-light hover:underline-primary" /> -->
            <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
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
      <NuxtLink :href="LINKS.telegram"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
        <Icon name="ph:telegram-logo-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </NuxtLink>
      <NuxtLink :href="LINKS.github"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
        <Icon name="ph:github-logo-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </NuxtLink>
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="signOutFn">
        <!-- <Icon name="ph:sign-out-bold" /> -->
        <span>sign out</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'signup' }" />
      </div>
    </div>

    <div class="flex items-center lg:hidden">
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="toggleMenu()">
        <Icon name="ph:list-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </div>
    </div>
  </nav>
</template>
<style scoped></style>
