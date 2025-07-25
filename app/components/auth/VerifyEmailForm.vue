<script setup lang="ts">
import PATHS from '~/const/paths';
import { useSendVerificationEmail } from '@nhost/vue';
import { useAuthStore } from '~/store/auth.store';
import { useNotificationStore } from '~/store/notification.store';

const authStore = useAuthStore();
const { add } = useNotificationStore();

const { error, isError, isLoading, isSent, sendEmail } =
  useSendVerificationEmail();

const email = computed(() => String(authStore.getEmail));

async function sendVerification() {
  await sendEmail(email.value);

  if (isError.value) {
    console.log(
      error.value
        ? `email-verification error (${error.value?.status}): ${error.value?.message}`
        : `email-verification error`,
    );

    add({
      type: "negative",
      message: String(
        error.value
          ? `email-verification error: ${error.value?.message}`
          : `email-verification error`,
      ),
    });
  }

  if (isSent) {
    add({
      type: "positive",
      message: "Verification Email was sent to your mailbox",
    });
  }
}
</script>
<template>
  <div>
    <div class="flex flex-col items-center w-[340px]">
      <div class="flex flex-col items-center w-full border-2px border-solid border-semi-light p-8 rounded">
        <h5 class="text-lg font-bold mb-4">Verify your account</h5>
        <p class="op-60">
          Please check your mailbox and follow the verification link to verify
          your email. After verification go to
          <NuxtLink :to="{ path: PATHS.signin }" class="font-bold underline">Sign In</NuxtLink>.
        </p>
      </div>
      <div class="flex flex-col mt-4" v-if="!isLoading">
        <div class="flex flex-col text-center mt-4">
          <span class="font-main text-base text-paragraph">Don't see email?</span>
          <span class="text-base font-bold font-main underline cursor-pointer" @click="sendVerification">Send
            verification email again</span>
        </div>
      </div>
    </div>
  </div>

</template>
<style scoped></style>