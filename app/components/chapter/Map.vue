<script setup lang="ts">

const route = useRoute();

const link = computed(() => route.params.chapter as string);

const { data } = await useAsyncData(() =>
  queryCollection('content')
    .where("path", "LIKE", `%${link.value}%`)
    .where("order", ">", "0")
    .order("order", "ASC")
    .all()
)

const map = computed(() => data.value?.filter((item) => item.path !== `/${link.value}`) || []);
const page = computed(() => data.value?.filter((item) => item.path === `/${link.value}`)[0])!;


const author = computed(() => page.value?.author);
const date = computed(() => page.value?.date);

</script>
<template>
  <div v-if="map.length > 0 && page" class="sticky right-0 top-[100px] h-fit">
    <div class="toc-container">
      <h6 class="text-lg mb-2">{{ page.title }}</h6>
      <NuxtLink v-for="item in map" :key="item.id" :to="`/content${item.path}`">
        {{ item.order }}.
        {{ item.title }}
      </NuxtLink>
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
