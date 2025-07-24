<script setup lang="ts">
import PATHS from '~/const/paths';

definePageMeta({
  name: "chapter",
  path: PATHS.chapter,
});

const route = useRoute();

const link = computed(() => route.params.chapter as string);

</script>
<template>
  <div>
    <q-breadcrumbs gutter="md" class="text-base font-main lowercase">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Chapter" :to="link" />
    </q-breadcrumbs>
    <AppContent />
  </div>
</template>
<style scoped></style>