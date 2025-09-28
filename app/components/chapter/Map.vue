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

const chapter = computed(() => route.params.chapter as string);
const story = computed(() => route.params?.story as string | undefined);

const map = computed(() => data.value?.filter((item) => item.path !== `/${link.value}`) || []);
const page = computed(() => data.value?.filter((item) => item.path === `/${link.value}`)[0])!;

const author = computed(() => page.value?.author);
const date = computed(() => page.value?.date);
</script>
<template>
  <div v-if="map.length > 0 && page">
    <div class="toc-container w-[320px] max-h-[calc(100vh-140px)] overflow-auto s:hidden xl:flex xl:flex-col">
      <h6 class="text-sm font-bold mb-2"> {{ Number(page.order).toFixed(2) }}. {{ page.title.toLowerCase() }}</h6>

      <div v-for="item in map" :key="item.id">
        <NuxtLink :to="`/content${item.path}`" class="text-gray underline-light">
          {{ Number(item.order).toFixed(2) }}. {{ item.title.toLowerCase() }}
        </NuxtLink>
      </div>
    </div>

    <div class="s:flex justify-between xl:hidden">
      <div class="flex flex-col">
        <div class="flex flex-col mb-4">
          <q-breadcrumbs active-color="gray" gutter="sm" class="text-base font-main lowercase" separator-color="gray"
            separator="-">
            <q-breadcrumbs-el label="home" to="/"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
          </q-breadcrumbs>
        </div>

        <div v-for="item in map" :key="item.id">
          <NuxtLink :to="`/content${item.path}`" class="text-gray">
            {{ Number(item.order).toFixed(2) }}. {{ item.title.toLowerCase() }}
          </NuxtLink>
        </div>
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
  flex-direction: column;
  width: 320px;
  max-width: 320px;

  height: fit-content;
}

ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
