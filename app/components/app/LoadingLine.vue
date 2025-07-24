<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loading = ref(false);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:loading:end", () => {
  loading.value = false;
});
</script>

<template>
  <div class="loading-line">
    <div v-if="loading" class="loading-bar"></div>
  </div>
</template>

<style scoped>
.loading-line {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--gray, #525252);
  z-index: 9998;
}

.loading-bar {
  position: relative;
  top: 0;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--primary);
  box-shadow: 0 0 12px var(--primary);
  /* background: linear-gradient(
    to right,
    var(--secondary, #8cf424),
    var(--primary, #1758ee)
  ); */
  animation: loadingAnimation 0.2s linear forwards;
  z-index: 9999;
}

@keyframes loadingAnimation {
  0% {
    width: 0;
    opacity: 0;
  }

  100% {
    opacity: 1;
    width: 100%;
  }
}
</style>
