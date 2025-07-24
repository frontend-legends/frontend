<script setup lang="ts">
import { groupContent, type ContentItem } from '@/utils/groupContent'

const { data: home } = await useAsyncData(() =>
  queryCollection('content')
    .order("order", "ASC")
    .where("order", ">", "0")
    .select("title", "id", "path", "order")
    .all()
)

const grouped = computed(() => groupContent(home.value as ContentItem[]))
</script>

<template>
  <div class="mt-8">
    <h4>Map</h4>
    <div v-for="section in grouped" :key="section.order" class="my-4">
      <NuxtLink :to="`/content${section.path}`">
        <h4 class="text-xl font-bold">{{ section.order }}. {{ section.title.toLowerCase() }}</h4>
      </NuxtLink>
      <ul class="ml-4 list-disc">
        <li v-for="child in section.children" :key="child.id">
          <NuxtLink :to="`/content${child.path}`">
            {{ child.order.toFixed(1) }}. {{ child.title.toLowerCase() }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
