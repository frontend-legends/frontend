<script setup lang="ts">
const route = useRoute();

const isChapter = computed(() => route.name === "chapter");

const link = computed(() => {
  return route.name === "chapter" ? `/${route.params.chapter}` : `/${route.params.chapter}/${route.params.story}` as string;
})

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
})

</script>
<template>
  <div v-if="page" class="flex flex-col gap-32 lg:flex-row">

    <div class="flex flex-col flex-1">
      <ContentRenderer :value="page" class="prose" />
    </div>
    <div v-if="!isChapter" class="flex flex-col gap-4 sticky right-0 top-[100px] h-fit">
      <AppToc />
    </div>
    <ChapterMap v-else />
  </div>
  <AppNotFound v-else />
</template>
<style scoped></style>
