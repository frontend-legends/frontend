<script setup lang="ts">
import PATHS from "~/const/paths";
import { useNotificationStore } from "~/store/notification.store";

const { add } = useNotificationStore();
const { requestPasswordReset, isLoading } = useRequestPasswordReset();

const form = ref({
  email: "",
});

async function resetPasswordFn() {
  const result = await requestPasswordReset(form.value.email);

  if (!result.success) {
    console.log(`reset-password error: ${result.error}`);

    add({
      type: "negative",
      message: String(result.error || 'Password reset request failed'),
    });
    return;
  }

  add({
    type: "positive",
    message: "Reset password email was sent, please check your email",
  });
}
</script>
<template>
  <AuthPanel title="Сброс пароля">
    <template #lead>Пришлём на почту ссылку, по которой можно задать новый пароль.</template>

    <form class="fl-form" novalidate @submit.prevent="resetPasswordFn">
      <AuthField v-model="form.email" label="email" type="email" autocomplete="email" />
      <AuthSubmit :loading="isLoading" :disabled="!form.email">Отправить ссылку</AuthSubmit>
    </form>

    <template #footer>
      Вспомнил пароль? <NuxtLink :to="PATHS.signin">Войти</NuxtLink>
    </template>
  </AuthPanel>
</template>
<style scoped></style>