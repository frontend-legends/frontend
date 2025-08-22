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
  <div v-if="map.length > 0 && page">
    <div class="toc-container s:hidden xl:flex">
      <h6 class="text-sm mb-2">{{ page.title }}</h6>

      <div v-for="item in map" :key="item.id">
        <NuxtLink :to="`/content${item.path}`" class="text-gray">
          {{ item.order }}. {{ item.title }}
        </NuxtLink>

        <ul v-if="item.children">
          <li v-for="child in item.children" :key="child.id">
            <NuxtLink :to="`/content${child.path}`" class="text-gray">
              {{ child.order }}. {{ child.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="s:flex justify-between xl:hidden">
      <div class="flex flex-col">
        <h6 class="text-base capitalize mb-2">{{ page.title }}</h6>

        <div v-for="item in map" :key="item.id">
          <NuxtLink :to="`/content${item.path}`" class="text-gray">
            {{ item.order }}. {{ item.title }}
          </NuxtLink>

          <ul v-if="item.children">
            <li v-for="child in item.children" :key="child.id">
              <NuxtLink :to="`/content${child.path}`" class="text-gray">
                {{ child.order }}. {{ child.title }}
              </NuxtLink>
            </li>
          </ul>
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
  border: 1px solid var(--semi-gray);
  padding: 16px;
  width: 320px;
  max-width: 320px;

  height: fit-content;
}

ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
