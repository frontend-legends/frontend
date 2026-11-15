<script setup lang="ts">
const route = useRoute();

const isChapter = computed(() => route.name === "chapter");

const link = computed(() => {
  return route.name === "chapter" ? `/${route.params.chapter}` : `/${route.params.chapter}/${route.params.story}` as string;
});

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
});

useHead({
  title: page.value?.title ? `${page.value.order}. ${page.value.title}` : "frontend legends",
});

// Expose the current page (incl. frontmatter `date`) to prose components like ProseH1.
provide("contentPage", page);
</script>
<template>
  <div v-if="page" class="flex flex-col pb-4">
    <div class="flex flex-col flex-col-reverse justify-between gap-8 xl:flex-row">
      <div class="w-[calc(100vw-64px)] lg:w-full max-w-[768px]">
        <ContentRenderer :value="page" class="prose" />
        <!-- below xl a story has no sidebar (its outline is in the menu): «прочитано» closes the article -->
        <div v-if="!isChapter" class="xl:hidden mt-16 flex flex-col gap-2">
          <AppFinish />
          <small v-if="page.author" class="text-sm text-gray">Author: {{ page.author }}</small>
        </div>
      </div>
      <hr v-if="isChapter" class="s:block xl:hidden w-full text-semi-gray">
      <aside class="flex-col gap-4 relative xl:sticky xl:right-0 xl:top-[100px] h-fit"
        :class="isChapter ? 'flex' : 's:hidden xl:flex'">
        <AppToc v-if="!isChapter" class="flex flex-col gap-4" />
        <ChapterMap v-else class="flex flex-col gap-4" />
      </aside>
    </div>
    <StoryNavigation :order="page.order" />
    <StorySelectionMenu />
  </div>
  <AppNotFound v-else />
</template>
<style scoped></style>
