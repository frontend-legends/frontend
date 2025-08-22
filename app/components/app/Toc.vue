<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const link = computed(() => {
  return route.name === "chapter" ? `/${route.params.chapter}` : `/${route.params.chapter}/${route.params.story}` as string;
});

const name = computed(() => {
  return route.name === "chapter" ? route.params.chapter : route.params.story;
});

const cats = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
})

const author = computed(() => cats.data.value?.author);
const date = computed(() => cats.data.value?.date);

const isFinished = ref(false);
</script>
<template>
  <div>
    <div class="toc-container s:hidden xl:flex">
      <h6 class="text-sm mb-2">Table of contents</h6>
      <div v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
        <NuxtLink :to="`#${cat.id}`" class="text-gray">
          {{ cat.text }}
        </NuxtLink>
        <ul v-if="cat.children">
          <li v-for="item in cat.children" :key="item.id">
            <NuxtLink :to="`#${item.id}`" class="text-gray">
              {{ item.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <q-btn color="primary" :outline="!isFinished" class="w-full mt-4">
        <span>{{ isFinished ? "Unfinish" : "Finish" }}</span>
      </q-btn>
    </div>
    <div class="s:flex justify-between xl:hidden">
      <div class="flex flex-col">
        <h6 class="text-base capitalize mb-2">{{ name }}</h6>

        <div v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
          <NuxtLink :to="`#${cat.id}`" class="text-gray">
            {{ cat.text }}
          </NuxtLink>

          <ul v-if="cat.children">
            <li v-for="item in cat.children" :key="item.id">
              <NuxtLink :to="`#${item.id}`" class="text-gray">
                {{ item.text }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <q-btn color="primary" :outline="!isFinished" class="h-fit">
        <span>{{ isFinished ? "Unfinish" : "Finish" }}</span>
      </q-btn>
    </div>
    <div class="flex flex-col text-sm">
      <small v-if="author">Author: {{ author }}</small>
      <small v-if="date">Last edited: {{ useDateFormat(date, "DD MMM YYYY - HH:MM") }}</small>
    </div>
  </div>
</template>
<style scoped>
ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
