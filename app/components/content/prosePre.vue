<template>
  <div class="relative group bg-on-semi-dark rounded" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <pre ref="preRef" class="relative w-full overflow-auto" :class="$props.class"><slot /></pre>

    <div v-if="(filename || language) && !isHovered"
      class="absolute top-1 right-1 text-xs text-gray select-none pointer-events-none transition z-10">
      <span v-if="filename">{{ filename }}</span>
      <span v-else-if="language">.{{ language }}</span>
    </div>

    <div v-if="isHovered" class="absolute top-1 right-1 flex gap-1 transition z-20">
      <q-btn color="gray" flat v-if="isSupported" class="w-[36px] h-[36px] p-1 rounded" @click="copyCode">
        <Icon :name="isCopied ? 'ph:check-bold' : 'ph:copy-bold'" />
      </q-btn>
      <!-- <q-btn class="w-[36px] h-[36px] p-1 rounded">
        <Icon name="ph:shooting-star-bold" />
      </q-btn> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
})

const isHovered = ref(false);

const { copy, copied: isCopied, isSupported } = useClipboard({
  source: () => props.code,
})

const copyCode = () => copy(props.code)
</script>

<style scoped>
pre code .line {
  display: block;
}
</style>
