<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { storyGql } from "~/api/app";
import { useAuthStore } from "~/store/auth.store";
import { useNotificationStore } from "~/store/notification.store";

const route = useRoute();
const storyId = computed(() => {
  const chapter = route.params.chapter as string;
  const story = route.params.story as string | undefined;
  return story ? `${chapter}/${story}` : chapter;
});

const authStore = useAuthStore();
const { add } = useNotificationStore();

const userMetadata = computed(() => authStore.getUserMetadata);

const currentStory = computed(() =>
  userMetadata.value?.stories?.find((s) => s.title === storyId.value)
);

const isFinished = computed(() => currentStory.value?.is_finished ?? false);

const { loading: finishLoading, mutate: finishMutate } = useMutation(storyGql.FINISH);
const { loading: unfinishLoading, mutate: unfinishMutate } = useMutation(storyGql.UNFINISH);

const isLoading = computed(() => finishLoading.value || unfinishLoading.value);

async function handleBtn() {
  const newState = !isFinished.value;

  try {
    if (newState) {
      await finishMutate({ story_id: storyId.value });
    } else {
      await unfinishMutate({ story_id: storyId.value });
    }

    authStore.updateStoryProgress(storyId.value, newState);

    add({
      type: "positive",
      message: `Updated status: ${newState ? "finished" : "restarted"}`,
    });
  } catch (error: any) {
    console.error(error);
    add({
      type: "negative",
      message: error.message || "Error: unable to update status",
    });
  }
}
</script>

<template>
  <div>
    <q-btn class="w-full font-bold" color="positive" :outline="!isFinished" :loading="isLoading" @click="handleBtn">
      <span>{{ isFinished ? "Restart" : "Finish" }}</span>
    </q-btn>
  </div>
</template>
