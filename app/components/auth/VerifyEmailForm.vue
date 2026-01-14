<script setup lang="ts">
import PATHS from '~/const/paths';
import { useAuthStore } from '~/store/auth.store';
import { useNotificationStore } from '~/store/notification.store';

const authStore = useAuthStore();
const { add } = useNotificationStore();
const { resendVerificationEmail, isLoading } = useResendVerificationEmail();
const isCheckingVerification = ref(false);

const email = computed(() => String(authStore.getEmail || ""));

async function sendVerification() {
  const result = await resendVerificationEmail(email.value);

  if (!result.success) {
    console.log(`resend-verification error: ${result.error}`);

    add({
      type: "negative",
      message: String(result.error || 'Failed to resend verification email'),
    });
    return;
  }

  add({
    type: "positive",
    message: "Verification email was sent to your mailbox. Please check your email.",
  });
}

async function checkVerificationAndContinue() {
  isCheckingVerification.value = true;

  try {
    const config = useRuntimeConfig();
    const backendUrl = config.public.backendUrl || "http://localhost:4000";
    const token = localStorage.getItem("auth_token");

    const response = await fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query Me { me { id email name email_verified stories_finished created_at } }`,
      }),
    });

    const data = await response.json();
    const user = data?.data?.me;

    if (user?.email_verified) {
      // Update store with verified status
      authStore.setUser({
        id: user.id,
        email: user.email,
        displayName: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        avatarUrl: null,
        defaultRole: "user",
        isAnonymous: false,
        locale: "en",
        metadata: { stories: [] },
        phoneNumber: null,
        phoneNumberVerified: false,
        roles: ["user"],
      });

      add({
        type: "positive",
        message: "Email verified! Redirecting to home page.",
      });

      await navigateTo(PATHS.home);
    } else {
      add({
        type: "negative",
        message: "Email not yet verified. Please check your inbox and click the verification link.",
      });
    }
  } catch (error) {
    add({
      type: "negative",
      message: "Failed to check verification status. Please try again.",
    });
  } finally {
    isCheckingVerification.value = false;
  }
}
</script>
<template>
  <div>
    <div class="flex flex-col items-center w-[340px]">
      <div class="flex flex-col items-center w-full border-1px border-solid border-semi-light p-8">
        <h5 class="text-lg font-bold mb-4">Verify your account</h5>
        <p class="font-main text-center text-on-semi-light">
          Please check your mailbox and follow the verification link to verify
          your email. After verification go to
          <NuxtLink :to="{ path: PATHS.signin }" class="text-sm font-bold text-on-light underline">Sign In
          </NuxtLink>.
        </p>
      </div>
      <div class="flex flex-col mt-4" v-if="!isLoading">
        <div class="flex flex-col text-center mt-4">
          <span class="font-sans text-sm text-on-semi-light">Don't see email?</span>
          <span class="font-main text-sm font-bold underline cursor-pointer" @click="sendVerification">Send
            verification email again</span>
        </div>
      </div>
    </div>
  </div>

</template>
<style scoped></style>