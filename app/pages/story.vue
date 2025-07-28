<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "story",
  path: PATHS.story,
});

const route = useRoute();

const chapterParam = route.params.chapter as string
const storyParam = route.params.story as string

const chapter = computed(() => `/content/${chapterParam}`)
const story = computed(() => `/content/${chapterParam}/${storyParam}`)
</script>
<template>
  <div>
    <q-breadcrumbs gutter="md" class="text-base font-main lowercase">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el :label="chapterParam" :to="chapter" />
      <q-breadcrumbs-el :label="storyParam" :to="story" />
    </q-breadcrumbs>
    <AppContent />
  </div>
</template>
<style scoped></style>