<script setup lang="ts">
import { useAuthenticationStatus } from "@nhost/vue";

const { isLoading } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
})

const { isLoading: nhostLoading } = useAuthenticationStatus();
// const nhostUser = useUserData();

</script>
<template>
  <AppLoadingLine />
  <Transition name="loading">
    <AppLoading v-if="isLoading || nhostLoading" />
  </Transition>
  <div>
    <header>
      <AppNav />
    </header>
    <main>
      <section>
        <NuxtPage />
      </section>
    </main>
    <AppFooter />
  </div>
</template>
