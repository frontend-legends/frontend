<script setup lang="ts">
const { order } = defineProps<{
  order: number;
}>();

const nav = ref<{ id: string, title: string, path: string, order: number, navigation: boolean }[]>([]);

async function fetchNav() {
  const result = await queryCollection('content')
    .where('order', 'BETWEEN', [Number(order - 0.01).toFixed(2), Number(order + 0.01).toFixed(2)])
    .select('id', 'title', 'path', 'order', 'navigation')
    .order('order', 'ASC')
    .all();
  nav.value = result.map(item => ({
    ...item,
    navigation: typeof item.navigation === 'boolean' ? item.navigation : !!item.navigation
  }));
}

watch(() => order, fetchNav, { immediate: true });
</script>
<template>
  <div v-if="nav" class="flex items-center gap-16 mt-32">
    <NuxtLink v-for="item in nav" :key="item.id"
      class="flex-1 flex flex-col gap-1 border border-solid border-transparent bg-on-semi-dark p-8 text-inherit no-underline hover:bg-transparent hover:border-on-semi-dark"
      :class="order === item.order ? '' : ''" :to="`/content${item.path}`">
      <div class="flex items-center gap-x-2">
        <Icon
          :name="item.order < order ? 'ph:arrow-left-bold' : item.order === order ? 'ph:github-logo-bold' : 'ph:arrow-right-bold'" />
        <span>{{ Number(item.order).toFixed(2) }}. {{ String(item.title).toLowerCase() }}</span>
      </div>
      <span class="text-xs text-gray">{{ item.path }}</span>
    </NuxtLink>
  </div>
</template>
<style scoped></style>