<script setup lang="ts">
import type { NuxtError } from '#app'

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
    <main>
      <section>
        <div class="mt-8">
          <h2>{{ error?.statusCode }}</h2>
          <p class="text-sm mt-2">{{ error?.message }}</p>
          <q-btn color="primary" @click="handleError">Go back</q-btn>

        </div>
        <!-- <AppNotFound /> -->
      </section>
    </main>
    <AppFooter />
  </div>
</template>
