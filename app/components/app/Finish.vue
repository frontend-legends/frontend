<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { storyGql } from "~/api/app";
import { useAuthStore } from "~/store/auth.store";
import { useNotificationStore } from "~/store/notification.store";

const route = useRoute();
const storyPath = computed(() => {
  const chapter = route.params.chapter as string;
  const story = route.params.story as string | undefined;
  return story ? `${chapter}/${story}` : chapter;
});

const authStore = useAuthStore();
const { add } = useNotificationStore();

const userId = computed(() => authStore.getUserId);
const userMetadata = computed(() => authStore.getUserMetadata);

const currentStory = computed(() =>
  userMetadata.value?.stories?.find((s) => s.title === storyPath.value)
);

const isFinished = computed(() => currentStory.value?.is_finished ?? false);

const { loading: muLoading, error: muError, mutate: muFn } =
  useMutation(storyGql.FINISH);

async function handleBtn() {
  const newState = !isFinished.value;
  authStore.updateStoryProgress(storyPath.value, newState);

  try {
    await muFn({
      user_id: userId.value,
      metadata: userMetadata.value,
    });

    add({
      type: "positive",
      message: `Updated status: ${newState ? "finished" : "restarted"}`,
    });
  } catch {
    authStore.updateStoryProgress(storyPath.value, !newState);
    console.error(muError);
    add({
      type: "negative",
      message: "Error: unable to update status",
    });
  }
}
</script>

<template>
  <div>
    <q-btn class="w-full font-bold" color="positive" :outline="!isFinished" :loading="muLoading" @click="handleBtn">
      <span>{{ isFinished ? "Restart" : "Finish" }}</span>
    </q-btn>
  </div>
</template>
