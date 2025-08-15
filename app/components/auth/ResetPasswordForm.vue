<script setup lang="ts">
import { useResetPassword } from "@nhost/vue";
import PATHS from "~/const/paths";
import { useNotificationStore } from "~/store/notification.store";

const { add } = useNotificationStore();

const { error, isError, isLoading, isSent, resetPassword } = useResetPassword();

const form = ref({
  email: "",
});

async function resetPasswordFn() {
  await resetPassword(form.value.email);

  if (isError) {
    console.log(
      error.value
        ? `reset-password error (${error.value?.status}): ${error.value?.message}`
        : `reset-password error`,
    );

    add({
      type: "negative",
      message: String(
        error.value
          ? `reset-password error: ${error.value?.message}`
          : `reset-password error`,
      ),
    });
  }

  if (isSent) {
    add({
      type: "positive",
      message: "Reset password was sent, please check your email",
    });
  }
}
</script>
<template>
  <div class="flex flex-col items-center w-[340px]">
    <div class="flex flex-col items-center w-full rounded-md">
      <h5 class="text-lg font-bold mb-4">Reset password</h5>
      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="email" label="Email" v-model="form.email" />
      </div>
      <div class="mt-6 w-full">
        <q-btn :disable="!form.email" color="primary" class="w-full" :loading="isLoading" @click="resetPasswordFn">
          <span>Reset password</span>
        </q-btn>
      </div>
    </div>
    <div class="flex flex-col mt-4">
      <div class="flex flex-col text-center mt-4">
        <span class="text-gray text-sm">Don't have an account?</span>
        <NuxtLink class="text-sm font-bold text-on-light underline" :to="{ path: PATHS.signup }">Sign Up</NuxtLink>
      </div>
      <div class="flex flex-col text-center mt-4">
        <span class="text-sm">Remember the password?</span>
        <NuxtLink class="text-sm font-bold text-on-light underline" :to="{ path: PATHS.signin }">Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<style scoped></style>