<script setup lang="ts">
import LINKS from '~/const/links';
import PATHS from '~/const/paths';

const { switchMode, isDark } = useDarkMode();

const route = useRoute();
</script>
<template>
  <nav class="flex items-center w-full h-full justify-between max-width border-x border-semi-gray mx-auto bg-op-60">
    <NuxtLink :to="PATHS.home"
      class="relative border-right border-semi-gray flex items-center justify-center no-underline min-w-[60px] gap-x-2 px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
      <Icon name="ph:lightning-bold" />
      <h1 class="text-sm font-semibold">frontend legends</h1>

      <div
        class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
    </NuxtLink>
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

      <NuxtLink :to="PATHS.signin"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100"
        :class="{ 'op-100 text-on-light': route.name === 'signin' }">
        <span>sign-in</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'signin' }" />
      </NuxtLink>

      <NuxtLink :to="PATHS.signup"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100"
        :class="{ 'op-100 text-on-light': route.name === 'signup' }">
        <span>sign-up</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'signup' }" />
      </NuxtLink>
    </div>

    <div class="flex items-center lg:hidden">
      <div
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="toggleMenu">
        <Icon name="ph:list-bold" />

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
      </div>
    </div>
  </nav>
</template>
<style scoped></style>
