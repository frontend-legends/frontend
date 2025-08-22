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
  <div v-if="page" class="flex flex-col flex-col-reverse justify-between gap-x-8 xl:flex-row">

    <div class="w-full max-w-[768px]">
      <ContentRenderer :value="page" class="prose" />
    </div>
    <hr class="s:block xl:hidden w-full text-semi-gray">
    <AppToc class="flex flex-col gap-4 relative xl:sticky xl:right-0 xl:top-[100px] h-fit" v-if="!isChapter" />
    <ChapterMap class="flex flex-col gap-4 relative xl:sticky xl:right-0 xl:top-[100px] h-fit" v-else />
  </div>
  <AppNotFound v-else />
</template>
<style scoped></style>
