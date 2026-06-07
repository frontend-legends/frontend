<script setup lang="ts">
import { groupContent, type ContentItem } from "@/utils/groupContent";
import { useAuthStore } from "~/store/auth.store";

const authStore = useAuthStore();
const userMetadata = computed(() => authStore.getUserMetadata);

const { data: home } = await useAsyncData(() =>
  queryCollection("content")
    .order("order", "ASC")
    .where("order", ">", "0")
    .all()
);

const grouped = computed(() => groupContent(home.value as ContentItem[]));

function isCompleted(path: string) {
  if (!userMetadata.value?.stories) return false;

  // Normalize to format: /chapter/story (with leading /)
  const normalized = '/' + path
    .replace(/^\/?content\//, "")
    .replace(/^\/+/, "");

  return userMetadata.value.stories.some(
    (s) => s.title === normalized && s.is_finished
  );
}
</script>

<template>
  <div class="grid md:grid-cols-2 gap-4 my-12">
    <div v-for="section in grouped" :key="section.order">
      <h4 class="text-base font-semibold flex items-baseline gap-2">
        <NuxtLink class="text-on-light" :to="`/content${section.path}`">
          {{ section.order }}. {{ section.title.toLowerCase() }}
        </NuxtLink>
        <span v-if="section.date" class="text-xs font-normal text-on-semi-light no-underline" style="font-variant: sub">
          [{{ useDateFormat(section.date, 'DD MMM YYYY', { locales: 'ru' }) }}]
        </span>
      </h4>

      <ul class="ml-4 list-disc">
        <li v-for="child in section.children" :key="child.id" class="flex items-center gap-2">
          <NuxtLink class="text-sm font-main text-on-semi-light" :to="`/content${child.path}`">
            {{ child.order.toFixed(2) }}. {{ child.title.toLowerCase() }}
          </NuxtLink>

          <span v-if="child.date" class="text-xs text-gray no-underline" style="font-variant: sub">
            [{{ useDateFormat(child.date, 'DD MMM YYYY', { locales: 'ru' }) }}]
          </span>

          <Icon v-if="isCompleted(child.path)" name="ph:check-bold" class="text-positive w-3 h-3" />
        </li>
      </ul>
    </div>
  </div>
</template>
