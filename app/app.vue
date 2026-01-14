<script setup lang="ts">
const { isLoading } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
});

onMounted(async () => {
  // dark mode
  useDarkMode().init();
});
</script>
<template>
  <AppLoadingLine />
  <Transition name="loading">
    <AppLoading v-if="isLoading" />
  </Transition>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
