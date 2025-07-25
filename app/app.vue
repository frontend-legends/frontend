<script setup lang="ts">
import { useAuthenticationStatus } from "@nhost/vue";

const { isLoading } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
});

const { isLoading: nhostLoading } = useAuthenticationStatus();

onMounted(async () => {
  // dark mode
  useDarkMode().init();
});
</script>
<template>
  <AppLoadingLine />
  <Transition name="loading">
    <AppLoading v-if="isLoading || nhostLoading" />
  </Transition>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
