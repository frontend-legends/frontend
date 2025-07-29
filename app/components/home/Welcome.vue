<script setup lang="ts">
import { useUserData } from '@nhost/vue';

const user = useUserData();

const { data: page } = await useAsyncData("/", () => {
  return queryCollection('content')
    .where("order", "=", "0")
    .first()
});

const now = useNow();

</script>
<template>
  <div>
    <h6>{{ getGreeting(String(new Date(now))) }}, {{ user?.displayName }}</h6>
    <p>You started learning {{ useTimeAgo(String(user?.createdAt)) }}</p>
    <div v-if="page" class="flex flex-col gap-8 lg:flex-row">
      <div class="flex flex-col flex-1">
        <ContentRenderer :value="page" class="prose font-sans" />
      </div>
      <!-- <div class="bg-gray p-8 rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Welcome to Frontend Legends</h2>
      <p class="mb-4">This is a collection of resources and articles to help you become a better frontend developer.</p>
      <p class="mb-4">Explore the chapters and start your journey!</p>
      <NuxtLink to="/content" class="btn btn-primary">Start Exploring</NuxtLink>
      <p class="mt-4 text-sm text-gray-600">If you have any questions or suggestions, feel free to reach out!</p>
    </div> -->
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped></style>
