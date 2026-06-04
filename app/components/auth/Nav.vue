<script setup lang="ts">
import PATHS from '~/const/paths';
import { useAuthStore } from '~/store/auth.store';

const { toggleMenu } = useMenu();
const { switchMode, isDark } = useDarkMode();
const { signOut } = useSignOut();

const authStore = useAuthStore();
const isAuth = computed(() => authStore.getAuth);

const route = useRoute();

async function signOutFn() {
  signOut();
  await navigateTo({ path: PATHS.home });
}
</script>
<template>
  <nav class="flex items-center w-full h-full justify-between max-width border-x border-semi-gray mx-auto bg-op-60">
    <NuxtLink :to="PATHS.home"
      class="relative border-right border-semi-gray flex items-center justify-center no-underline min-w-[60px] gap-x-2 px-4 h-[48px] text-on-light op-80 transition group hover:op-100">
      <img src="/assets/logos/dark-on-light.svg" width="20" height="20" alt="FL" v-show="isDark" />
      <img src="/assets/logos/light-on-dark.svg" width="20" height="20" alt="FL" v-show="!isDark" />

      <h1 class="text-base uppercase" style="font-variant: sub">Frontend Legends</h1>

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

      <NuxtLink v-if="!isAuth" :to="PATHS.signin"
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light op-80 transition group hover:op-100"
        :class="{ 'op-100 text-on-light': route.name === 'signin' }">
        <span class="uppercase" style="font-variant: sub">sign in</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full"
          :class="{ 'w-full bg-on-light!': route.name === 'signin' }" />
      </NuxtLink>

      <div v-else
        class="relative border-left border-semi-gray flex items-center justify-center no-underline min-w-[60px] px-4 h-[48px] text-on-light cursor-pointer op-80 transition group hover:op-100"
        @click="signOutFn">
        <span class="uppercase" style="font-variant: sub">sign out</span>

        <div
          class="absolute left-0 bottom-1px w-0 h-[3px] bg-on-semi-dark transition-all duration-300 group-hover:w-full" />
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
