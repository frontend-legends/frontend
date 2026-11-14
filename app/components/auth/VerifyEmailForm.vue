<script setup lang="ts">
import PATHS from '~/const/paths';
import { useAuthStore } from '~/store/auth.store';
import { useNotificationStore } from '~/store/notification.store';

const authStore = useAuthStore();
const { add } = useNotificationStore();
const { resendVerificationEmail, isLoading } = useResendVerificationEmail();
const { verifyEmail, isLoading: isVerifying } = useVerifyEmail();
const route = useRoute();

const isCheckingVerification = ref(false);
const isAutoVerifying = ref(false);
const verificationError = ref<string | null>(null);

const email = computed(() => String(authStore.getEmail || ""));

// Auto-verify if token is in URL
onMounted(async () => {
  const token = route.query.token as string;
  if (token) {
    isAutoVerifying.value = true;
    verificationError.value = null;

    const result = await verifyEmail(token);

    if (result.success) {
      add({
        type: "positive",
        message: "Email verified successfully! Redirecting...",
      });
      await navigateTo(PATHS.home);
    } else {
      verificationError.value = result.error || "Email verification failed";
      add({
        type: "negative",
        message: verificationError.value,
      });
    }

    isAutoVerifying.value = false;
  }
});

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
        query: `query Me { me { id email name email_verified stories_finished created_at story_progress { story { slug } created_at } } }`,
      }),
    });

    const data = await response.json();
    const user = data?.data?.me;

    if (user?.email_verified) {
      // Transform story_progress into the expected metadata.stories format
      const stories = (user.story_progress || []).map((progress: any) => ({
        title: progress.story?.slug || '',
        is_finished: true,
        last_updated: progress.created_at || new Date().toISOString(),
      }));

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
        metadata: { stories },
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
  <AuthPanel :title="isAutoVerifying ? 'Проверяем почту…' : 'Подтверди почту'">
    <template #lead>
      <template v-if="isAutoVerifying">Секунду, сверяем ссылку из письма.</template>
      <template v-else>
        Мы отправили письмо<template v-if="email"> на <b>{{ email }}</b></template>. Перейди по ссылке из него,
        затем <NuxtLink :to="PATHS.signin" class="fl-form__inline-link">войди</NuxtLink>.
      </template>
    </template>

    <p v-if="verificationError" class="fl-form__error" role="alert">{{ verificationError }}</p>

    <form v-if="!isAutoVerifying" class="fl-form" @submit.prevent="checkVerificationAndContinue">
      <AuthSubmit :loading="isCheckingVerification">Я подтвердил, продолжить</AuthSubmit>
    </form>

    <template v-if="!isAutoVerifying" #footer>
      Письма нет? <button type="button" :disabled="isLoading" @click="sendVerification">Отправить ещё раз</button>
    </template>
  </AuthPanel>
</template>
<style scoped></style>