<script setup lang="ts">
import PATHS from "~/const/paths";
import LINKS from "~/const/links";

definePageMeta({
  name: "contributors",
  path: PATHS.contributors,
});

useHead({ title: "Contributors — Frontend Legends" });

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

const REPO = "frontend-legends/content";
const REPO_URL = `https://github.com/${REPO}`;

const { data, pending, error } = await useFetch<Contributor[]>(
  `https://api.github.com/repos/${REPO}/contributors?per_page=100`,
  { key: "contributors" },
);

const contributors = computed(() =>
  (data.value || []).filter((c) => c.type === "User"),
);
</script>

<template>
  <div class="flex flex-col gap-8 font-sans">
    <!-- header -->
    <div class="flex items-end justify-between flex-wrap gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl lowercase">contributors</h2>
        <p class="text-xs text-gray">авторы и редакторы контента</p>
      </div>

      <div class="flex gap-2">
        <a
          :href="LINKS.telegram"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 bg-primary text-white px-3 py-2 no-underline op-90 transition hover:op-100"
        >
          <Icon name="ph:telegram-logo-bold" class="text-lg" />
          <span class="uppercase text-sm" style="font-variant: sub">telegram</span>
        </a>
        <a
          :href="REPO_URL"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 bg-on-semi-dark px-3 py-2 text-on-light no-underline op-90 transition hover:op-100"
        >
          <Icon name="ph:github-logo-bold" class="text-lg" />
          <span class="uppercase text-sm" style="font-variant: sub">github</span>
        </a>
      </div>
    </div>

    <div v-if="pending" class="text-sm text-gray py-8 text-center">Загрузка…</div>

    <div v-else-if="error" class="text-sm text-negative py-8 text-center">
      Не удалось загрузить контрибьюторов (возможно, превышен лимит GitHub API).
    </div>

    <div v-else-if="!contributors.length" class="text-sm text-gray py-12 text-center">
      Здесь ещё никого нет.
    </div>

    <!-- grid: 3 → 6 cards per row, everyone included -->
    <div v-else class="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <a
        v-for="(c, i) in contributors"
        :key="c.login"
        :href="c.html_url"
        target="_blank"
        rel="noopener"
        class="relative flex flex-col items-center gap-2 p-4 border border-solid border-semi-gray text-on-light no-underline transition hover:border-primary"
      >
        <span
          class="absolute top-0 left-0 min-w-5 h-5 px-1 grid place-items-center bg-on-semi-dark text-on-light text-[10px] font-main font-bold"
        >#{{ i + 1 }}</span>

        <img
          :src="c.avatar_url"
          :alt="c.login"
          width="56"
          height="56"
          class="w-14 h-14 object-cover mt-1"
          loading="lazy"
        >
        <span class="font-main font-semibold text-sm truncate max-w-full">{{ c.login }}</span>
        <span class="text-[11px] text-gray">{{ c.contributions }} commits</span>
      </a>
    </div>
  </div>
</template>
