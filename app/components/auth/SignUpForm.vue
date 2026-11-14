<script setup lang="ts">
import { useNotificationStore } from '~/store/notification.store';
import PATHS from '~/const/paths';

const { add } = useNotificationStore();
const { errors, validate } = useSignUpValidation();
const { signUp: signUpMutation, isLoading } = useSignUp();

const form = ref({
  login: "",
  email: "",
  password: "",
  // repeatPassword: "",
});

const isFormFull = computed(() =>
  form.value.login &&
    form.value.login.length > 4 &&
    form.value.email &&
    form.value.password &&
    form.value.password.length >= 6
    ? true
    : false,
);

async function signUp() {
  if (!validate(form.value)) return;

  const result = await signUpMutation(form.value.email, form.value.password, form.value.login);

  if (!result.success) {
    console.log(`sign-up error: ${result.error}`);

    return add({
      type: "negative",
      message: String(result.error || 'Sign up failed'),
    });
  }

  if (result.needsEmailVerification) {
    // REDIRECT TO VERIFICATION
    await navigateTo({ path: PATHS.verifyemail });
    return;
  }

  // REDIRECT TO SIGN IN
  await navigateTo({ path: PATHS.signin });
}
</script>
<template>
  <AuthPanel title="Создать аккаунт">
    <template #lead>Прогресс по главам сохранится, и подготовку можно будет продолжить с любого устройства.</template>

    <form class="fl-form" novalidate @submit.prevent="signUp">
      <AuthField v-model="form.login" label="логин" autocomplete="username" hint="минимум 5 символов"
        :error="errors.login" />
      <AuthField v-model="form.email" label="email" type="email" autocomplete="email" :error="errors.email" />
      <AuthField v-model="form.password" label="пароль" type="password" autocomplete="new-password"
        hint="минимум 6 символов" :error="errors.password" />
      <AuthSubmit :loading="isLoading" :disabled="!isFormFull">Создать аккаунт</AuthSubmit>
    </form>

    <AuthOauth />
  </AuthPanel>
</template>
<style scoped></style>