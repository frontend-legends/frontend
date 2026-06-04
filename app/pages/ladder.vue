<script setup lang="ts">
import { useQuery } from "@vue/apollo-composable";
import { usersGql } from "~/api/app";
import { useAuthStore } from "~/store/auth.store";
import PATHS from "~/const/paths";

definePageMeta({
  name: "ladder",
  path: PATHS.ladder,
});

useHead({ title: "Ladder — Frontend Legends" });

const authStore = useAuthStore();
const meId = computed(() => authStore.getUserId);

const period = ref<"month" | "all">("month");

const now = useNow();
const monthlyVars = computed(() => ({
  year: new Date(now.value).getFullYear(),
  month: new Date(now.value).getMonth() + 1,
  limit: 100,
}));

const { result: monthlyRes, loading: monthlyLoading } = useQuery(
  usersGql.MONTHLY_LEADERBOARD,
  monthlyVars,
);
const { result: globalRes, loading: globalLoading } = useQuery(
  usersGql.GLOBAL_LEADERBOARD,
  { limit: 100 },
);

interface Entry {
  rank: number;
  user: { id: string; name: string | null };
  stories_finished: number;
}

const entries = computed<Entry[]>(() =>
  period.value === "month"
    ? monthlyRes.value?.monthly_leaderboard || []
    : globalRes.value?.global_leaderboard || [],
);
const loading = computed(() =>
  period.value === "month" ? monthlyLoading.value : globalLoading.value,
);

const top3 = computed(() => entries.value.slice(0, 3));
const tableEntries = computed(() =>
  entries.value.length >= 3 ? entries.value.slice(3) : entries.value,
);

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ACCENTS: Record<number, string> = {
  1: "var(--warning)",
  2: "#9aa0a6",
  3: "#b06a2c",
};
</script>

<template>
  <div class="flex flex-col gap-8 font-sans">
    <!-- header -->
    <div class="flex items-end justify-between flex-wrap gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl lowercase">ladder</h2>
        <p class="text-xs text-gray">рейтинг по завершённым главам</p>
      </div>

      <!-- period toggle -->
      <div class="flex gap-2">
        <q-btn :flat="period !== 'month'" :color="period === 'month' ? 'primary' : undefined" no-caps
          @click="period = 'month'">
          <span class="uppercase" style="font-variant: sub">monthly</span>
        </q-btn>
        <q-btn :flat="period !== 'all'" :color="period === 'all' ? 'primary' : undefined" no-caps
          @click="period = 'all'">
          <span class="uppercase" style="font-variant: sub">all time</span>
        </q-btn>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-gray py-8 text-center">Загрузка…</div>

    <div v-else-if="!entries.length" class="text-sm text-gray py-12 text-center">
      Здесь ещё никого нет — станьте первым
    </div>

    <template v-else>
      <!-- top 3 -->
      <div v-if="entries.length >= 3" class="grid gap-4 md:grid-cols-3">
        <div
          v-for="entry in top3"
          :key="entry.user.id"
          class="relative flex flex-col items-center gap-3 p-6 border border-solid"
          :class="entry.user.id === meId ? 'border-primary' : 'border-on-semi-dark'"
        >
          <span class="absolute top-0 left-0 right-0 h-[3px]" :style="{ background: ACCENTS[entry.rank] }" />
          <span class="font-main font-bold text-lg" :style="{ color: ACCENTS[entry.rank] }">#{{ entry.rank }}</span>
          <div class="w-14 h-14 grid place-items-center bg-on-semi-dark font-bold text-lg">
            {{ initials(entry.user.name) }}
          </div>
          <span class="font-semibold text-center">{{ entry.user.name || "anon" }}</span>
          <span class="text-sm text-gray">{{ entry.stories_finished }} завершено</span>
        </div>
      </div>

      <!-- list -->
      <div v-if="tableEntries.length" class="flex flex-col">
        <div
          class="grid grid-cols-[36px_1fr_90px] items-center px-3 py-2 text-[11px] uppercase tracking-wide text-gray"
        >
          <span>#</span>
          <span>пользователь</span>
          <span class="text-right">завершено</span>
        </div>

        <div
          v-for="entry in tableEntries"
          :key="entry.user.id"
          class="row grid grid-cols-[36px_1fr_90px] items-center px-3 py-3 text-sm transition hover:bg-on-semi-dark"
          :class="{ 'lb-me': entry.user.id === meId }"
        >
          <span class="font-main font-bold text-gray">{{ entry.rank }}</span>
          <span class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 grid place-items-center bg-on-semi-dark text-xs font-bold shrink-0">
              {{ initials(entry.user.name) }}
            </span>
            <span class="truncate">{{ entry.user.name || "anon" }}</span>
            <span
              v-if="entry.user.id === meId"
              class="text-[10px] uppercase tracking-wide text-semi-primary shrink-0"
            >вы</span>
          </span>
          <span class="text-right font-main font-bold">{{ entry.stories_finished }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* faint hairline between rows only (no boxy borders) */
.row + .row {
  border-top: 1px solid color-mix(in srgb, var(--on-light) 8%, transparent);
}

/* current user highlight — token-based tint */
.lb-me {
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  box-shadow: inset 2px 0 0 var(--primary);
}
</style>
