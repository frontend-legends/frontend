<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const link = computed(() => {
  return route.name === "chapter" ? `/${route.params.chapter}` : `/${route.params.chapter}/${route.params.story}` as string;
})

const cats = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
})

const author = computed(() => cats.data.value?.author);
const date = computed(() => cats.data.value?.date);

</script>
<template>
  <div class="sticky right-0 top-[100px] h-fit">
    <div class="toc-container">
      <h6 class="text-lg mb-2">Table of contents</h6>
      <div v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
        <NuxtLink :to="`#${cat.id}`">
          {{ cat.text }}
        </NuxtLink>

        <ul v-if="cat.children">
          <li v-for="item in cat.children" :key="item.id">
            <NuxtLink :to="`#${item.id}`">
              {{ item.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex flex-col mt-4 text-sm">
      <small v-if="author">Author: {{ author }}</small>
      <small v-if="date">Last edited: {{ useDateFormat(date, "DD MMM YYYY - HH:MM") }}</small>
    </div>
  </div>
</template>
<style scoped>
.toc-container {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid var(--semi-gray);
  padding: 32px;
  width: 320px;

  height: fit-content;
}

ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
