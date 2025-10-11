<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { storyGql } from "~/api/app";
import { useAuthStore } from "~/store/auth.store";
import { useNotificationStore } from "~/store/notification.store";

const route = useRoute();
const storyTitle = computed(
  () => (route.params.story as string) || (route.params.chapter as string)
);

const authStore = useAuthStore();
const { add } = useNotificationStore();

const userId = computed(() => authStore.getUserId);
const userMetadata = computed(() => authStore.getUserMetadata);

const currentStory = computed(() =>
  userMetadata.value?.stories?.find((s) => s.title === storyTitle.value)
);
const isFinished = computed(() => currentStory.value?.is_finished ?? false);

const { loading: muLoading, error: muError, mutate: muFn } =
  useMutation(storyGql.FINISH);

async function handleBtn() {
  const newState = !isFinished.value;

  authStore.updateStoryProgress(storyTitle.value, newState);

  try {
    await muFn({
      user_id: userId.value,
      metadata: userMetadata.value,
    });

    add({
      type: "positive",
      message: `История ${newState ? "завершена" : "возобновлена"}`,
    });
  } catch {
    authStore.updateStoryProgress(storyTitle.value, !newState);

    console.error(muError);

    add({
      type: "negative",
      message: "Ошибка: не удалось обновить статус истории",
    });
  }
}
</script>

<template>
  <div>
    <q-btn class="w-full" color="positive" :outline="!isFinished" :loading="muLoading" @click="handleBtn">
      <span>{{ isFinished ? "Возобновить" : "Завершить" }}</span>
    </q-btn>
  </div>
</template>

<style scoped></style>
