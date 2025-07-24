<script setup lang="ts"></script>
<template>
  <div class="background">
    <div class="loader"></div>
  </div>
</template>
<style scoped>
.background {
  display: block;
  position: fixed;
  z-index: 99999;

  left: 0;
  top: 3px;
  width: 100vw;
  height: 100vh;

  backdrop-filter: blur(8px);
  background-color: rgba(31, 31, 32, 0.6);
}

.loader {
  display: block;
  position: fixed;
  z-index: 99998;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: solid 2px transparent;
  border-top-color: var(--primary);
  border-left-color: var(--primary);
  border-bottom-color: var(--light);
  border-right-color: var(--light);
  border-radius: 50%;
  -webkit-animation: loader 400ms linear infinite;
  animation: loader 400ms linear infinite;
}

@-webkit-keyframes loader {
  0% {
    -webkit-transform: translate(-50%, -50%) rotate(0deg);
  }

  100% {
    -webkit-transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes loader {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>