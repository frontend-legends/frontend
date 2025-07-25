<script setup lang="ts">
import type { NuxtError } from '#app'
import PATHS from './const/paths';

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>
<template>
  <AppLoadingLine />
  <div>
    <header>
      <AppNav />
    </header>
    <main class="flex flex-col items-center justify-center">
      <section>
        <div class="flex flex-col items-center mt-8">
          <h2>{{ error?.statusCode }}</h2>
          <p class="text-sm">{{ error?.message }}</p>
          <div class="flex gap-4 mt-4">
            <q-btn color="primary" :to="PATHS.home">Go home</q-btn>

            <q-btn outline @click="handleError">Go back</q-btn>
          </div>

        </div>
        <!-- <AppNotFound /> -->
      </section>
    </main>
    <AppFooter />
  </div>
</template>
