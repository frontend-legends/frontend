<script setup lang="ts">
import PATHS from '~/const/paths';
import LINKS from '~/const/links';
import { useAuthStore } from '~/store/auth.store';

const { toggleMenu } = useMenu();
const { switchMode, isDark } = useDarkMode();
const { signOut } = useSignOut();

const authStore = useAuthStore();
const isAuth = computed(() => authStore.getAuth);

const route = useRoute();
const chapter = computed(() => route.params.chapter as string);
const story = computed(() => route.params?.story as string | undefined);

async function signOutFn() {
  signOut();
  toggleMenu(false);
  await navigateTo({ path: PATHS.home });
}
</script>

<template>
  <div
    class="fixed top-[48px] left-0 right-0 bottom-0 z-50 lg:hidden flex flex-col gap-3 p-6 bg-on-dark font-main">
    <!-- breadcrumb on content pages -->
    <q-breadcrumbs v-if="route.name === 'chapter' || route.name === 'story'" active-color="gray" gutter="sm"
      class="text-base font-main lowercase mb-1" separator-color="gray" separator="-">
      <q-breadcrumbs-el label="home" to="/" @click="toggleMenu(false)" />
      <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`" @click="toggleMenu(false)" />
      <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`" @click="toggleMenu(false)" />
    </q-breadcrumbs>

    <!-- internal nav -->
    <NuxtLink :to="PATHS.ladder" @click="toggleMenu(false)"
      class="flex items-center gap-3 px-5 py-3.5 border border-solid border-on-semi-dark text-on-light no-underline transition hover:bg-on-semi-dark"
      :class="{ 'bg-on-semi-dark': route.name === 'ladder' }">
      <Icon name="ph:ranking-bold" class="text-lg" />
      <span class="uppercase" style="font-variant: sub">ladder</span>
      <Icon name="ph:caret-right-bold" class="text-sm op-40 ml-auto" />
    </NuxtLink>
    <NuxtLink :to="PATHS.contributors" @click="toggleMenu(false)"
      class="flex items-center gap-3 px-5 py-3.5 border border-solid border-on-semi-dark text-on-light no-underline transition hover:bg-on-semi-dark"
      :class="{ 'bg-on-semi-dark': route.name === 'contributors' }">
      <Icon name="ph:users-three-bold" class="text-lg" />
      <span class="uppercase" style="font-variant: sub">contributors</span>
      <Icon name="ph:caret-right-bold" class="text-sm op-40 ml-auto" />
    </NuxtLink>

    <!-- utilities -->
    <button type="button"
      class="flex items-center gap-3 px-5 py-3.5 border border-solid border-on-semi-dark bg-transparent text-on-light transition hover:bg-on-semi-dark"
      @click="switchMode">
      <Icon :name="isDark ? 'ph:sun-bold' : 'ph:moon-bold'" class="text-lg" />
      <span class="uppercase" style="font-variant: sub">switch theme</span>
    </button>
    <a :href="LINKS.telegram" target="_blank" rel="noopener"
      class="flex items-center gap-3 px-5 py-3.5 border border-solid border-on-semi-dark text-on-light no-underline transition hover:bg-on-semi-dark">
      <Icon name="ph:telegram-logo-bold" class="text-lg" />
      <span class="uppercase" style="font-variant: sub">telegram</span>
      <Icon name="ph:arrow-up-right-bold" class="text-sm op-40 ml-auto" />
    </a>
    <a :href="LINKS.github" target="_blank" rel="noopener"
      class="flex items-center gap-3 px-5 py-3.5 border border-solid border-on-semi-dark text-on-light no-underline transition hover:bg-on-semi-dark">
      <Icon name="ph:github-logo-bold" class="text-lg" />
      <span class="uppercase" style="font-variant: sub">github</span>
      <Icon name="ph:arrow-up-right-bold" class="text-sm op-40 ml-auto" />
    </a>

    <div class="flex-1" />

    <!-- auth action (no icon) -->
    <div v-if="isAuth"
      class="flex items-center justify-center px-5 py-4 bg-on-light text-on-dark cursor-pointer transition hover:op-90"
      @click="signOutFn">
      <span class="uppercase" style="font-variant: sub">sign out</span>
    </div>
    <NuxtLink v-else :to="PATHS.signin" @click="toggleMenu(false)"
      class="flex items-center justify-center px-5 py-4 bg-primary text-white no-underline transition hover:op-90">
      <span class="uppercase" style="font-variant: sub">sign in</span>
    </NuxtLink>
  </div>
</template>
