<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useNotificationStore } from "~/store/notification.store";

const store = useNotificationStore();
const { notifications } = storeToRefs(store);

// newest on top
const stack = computed(() => [...notifications.value].reverse());
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-[60px] right-4 z-[3000] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-32px)] pointer-events-none"
      aria-live="polite"
    >
      <AppNotification
        v-for="n in stack"
        :key="n.id"
        :n="n"
        @close="store.remove"
      />
    </div>
  </Teleport>
</template>
