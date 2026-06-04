<script setup lang="ts">
import PATHS from '~/const/paths';
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
          <img v-show="isDark" src="/assets/logos/dark-on-light.svg" width="20" height="20" alt="FL" >
          <img v-show="!isDark" src="/assets/logos/light-on-dark.svg" width="20" height="20" alt="FL" >

          <h1 class="text-base uppercase" style="font-variant: sub">Frontend Legends</h1>

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
      <NuxtLink :to="PATHS.ladder"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100"
        :class="{ 'op-100': route.name === 'ladder' }">
        <Icon name="ph:ranking-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'ladder' }" />
      </NuxtLink>
      <NuxtLink :to="PATHS.contributors"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100"
        :class="{ 'op-100': route.name === 'contributors' }">
        <Icon name="ph:users-three-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'contributors' }" />
      </NuxtLink>
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="signOutFn">
        <!-- <Icon name="ph:sign-out-bold" /> -->
        <span class="uppercase" style="font-variant: sub">sign out</span>

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
