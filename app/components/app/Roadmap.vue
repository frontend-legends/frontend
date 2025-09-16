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
  <div class="grid md:grid-cols-2 gap-4 my-12">
    <div v-for="section in grouped" :key="section.order">
      <NuxtLink class="text-on-light" :to="`/content${section.path}`">
        <h4 class="text-base font-semibold">{{ section.order }}. {{ section.title.toLowerCase() }}</h4>
      </NuxtLink>
      <ul class="ml-4 list-disc">
        <li v-for="child in section.children" :key="child.id">
          <NuxtLink class="text-on-semi-light text-sm font-main" :to="`/content${child.path}`">
            {{ child.order.toFixed(2) }}. {{ child.title.toLowerCase() }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
