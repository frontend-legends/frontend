<script setup lang="ts">
import { useNotificationStore } from '~/store/notification.store';
import PATHS from '~/const/paths';

const { add } = useNotificationStore();
const { errors, validate } = useSignInValidation();
const { signIn: signInMutation, isLoading } = useSignIn();

const form = ref({
  email: "",
  password: "",
});

const isFormFull = computed(() =>
  form.value.email && form.value.password ? true : false,
);

async function signIn() {
  if (!validate(form.value)) return;

  const result = await signInMutation(form.value.email, form.value.password);

  if (!result.success) {
    console.log(`sign-in error: ${result.error}`);

    add({
      type: "negative",
      message: String(result.error || 'Sign in failed'),
    });
    return;
  }

  if (result.needsEmailVerification) {
    // REDIRECT TO VERIFICATION
    navigateTo({ path: PATHS.verifyemail });
    return;
  }

  // REDIRECT TO HOME
  navigateTo({ path: PATHS.home });
}
</script>
<template>
  <AuthPanel title="С возвращением">
    <template #lead>Войди, чтобы отмечать пройденные главы и продолжать с того места, где остановился.</template>

    <form class="fl-form" novalidate @submit.prevent="signIn">
      <AuthField v-model="form.email" label="email" type="email" autocomplete="email" :error="errors.email" />
      <div class="fl-form__pw">
        <AuthField v-model="form.password" label="пароль" type="password" autocomplete="current-password"
          :error="errors.password" />
        <NuxtLink :to="PATHS.resetpassword" class="fl-form__forgot">забыл пароль?</NuxtLink>
      </div>
      <AuthSubmit :loading="isLoading" :disabled="!isFormFull">Войти</AuthSubmit>
    </form>

    <AuthOauth />
  </AuthPanel>
</template>
<style scoped></style>