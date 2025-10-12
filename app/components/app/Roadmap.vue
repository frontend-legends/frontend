<script setup lang="ts">
import { groupContent, type ContentItem } from "@/utils/groupContent";
import { useAuthStore } from "~/store/auth.store";

const authStore = useAuthStore();
const userMetadata = computed(() => authStore.getUserMetadata);

const { data: home } = await useAsyncData(() =>
  queryCollection("content")
    .order("order", "ASC")
    .where("order", ">", "0")
    .select("title", "id", "path", "order")
    .all()
);

const grouped = computed(() => groupContent(home.value as ContentItem[]));

function isCompleted(path: string) {
  if (!userMetadata.value?.stories) return false;

  const normalized = path
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
      <NuxtLink class="text-on-light" :to="`/content${section.path}`">
        <h4 class="text-base font-semibold">
          {{ section.order }}. {{ section.title.toLowerCase() }}
        </h4>
      </NuxtLink>

      <ul class="ml-4 list-disc">
        <li v-for="child in section.children" :key="child.id" class="flex items-center gap-2">
          <NuxtLink class="text-sm font-main text-on-semi-light" :to="`/content${child.path}`">
            {{ child.order.toFixed(2) }}. {{ child.title.toLowerCase() }}
          </NuxtLink>

          <Icon v-if="isCompleted(child.path)" name="ph:check-bold" class="text-positive w-3 h-3" />
        </li>
      </ul>
    </div>
  </div>
</template>
