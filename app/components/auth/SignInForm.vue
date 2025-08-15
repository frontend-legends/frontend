<script setup lang="ts">
import { useNhostClient, useSignInEmailPassword } from '@nhost/vue';
import { useAuthStore } from '~/store/auth.store';
import { useNotificationStore } from '~/store/notification.store';
import type { IAuthStoreUser } from '~/types/user.type';
import PATHS from '~/const/paths';

const authStore = useAuthStore();
const { nhost } = useNhostClient();
const { add } = useNotificationStore();
const { errors, validate } = useSignInValidation();

const {
  signInEmailPassword,
  needsEmailVerification,
  isLoading,
  isSuccess,
  isError,
  error,
  user,
} = useSignInEmailPassword();

const form = ref({
  email: "",
  password: "",
});


const isFormFull = computed(() =>
  form.value.email && form.value.password ? true : false,
);

async function signIn() {
  if (!validate(form.value)) return;

  await signInEmailPassword(form.value.email, form.value.password);

  if (isError.value) {
    console.log(
      error.value
        ? `sign-in error (${error.value?.status}): ${error.value?.message}`
        : `sign-in error`,
    );

    add({
      type: "negative",
      message: String(
        error.value
          ? `sign-in error: ${error.value?.message}`
          : `sign-in error`,
      ),
    });
  }

  if (needsEmailVerification.value) {
    // REDIRECT TO VERIFICATION
    navigateTo({ path: PATHS.verifyemail });
  }

  if (isSuccess.value) {
    // SET USER STORE
    authStore.setUser(user.value as unknown as IAuthStoreUser);

    // REDIRECT TO HOME
    navigateTo({ path: PATHS.home });
  }
}

function signInGoogle() {
  nhost.auth.signIn({
    provider: 'google',
  })
}

function signInGithub() {
  nhost.auth.signIn({
    provider: 'github',
  })
}
</script>
<template>
  <div class="flex flex-col items-center w-[340px]">
    <div class="flex flex-col items-center w-full border-1px border-solid border-semi-gray p-8">
      <h5 class="text-lg font-bold mb-4">Frontend Legends</h5>
      <div class="mt-4 w-full">
        <q-input v-model="form.email" color="primary" type="email" label="Email" :error="!!errors.email"
          :error-message="errors.email" class="text-light" />
      </div>
      <div class="mt-4 w-full">
        <q-input v-model="form.password" color="primary" type="password" label="Password" :error="!!errors.password"
          :error-message="errors.password" />
      </div>
      <div class="mt-4 w-full">
        <q-btn color="primary" class="w-full" :disable="!isFormFull" :loading="isLoading" @click="signIn">
          <span>Sign In</span>
        </q-btn>
      </div>
    </div>
    <div class="flex gap-x-8 w-full mt-8">
      <q-btn outline class="flex-1" :disable="true" @click="signInGoogle">
        <Icon name="ph:google-logo-bold" class="mr-2" />
        <span>Google</span>
      </q-btn>
      <q-btn outline class="flex-1" @click="signInGithub">
        <Icon name="ph:github-logo-bold" class="mr-2" />
        <span>Github</span>
      </q-btn>
    </div>
    <div class="flex flex-col mt-4">
      <div class="flex flex-col text-center mt-4">
        <span class="font-main text-gray text-sm text-paragraph">Don't have an account?</span>
        <NuxtLink class="text-sm font-bold text-on-light underline" :to="{ path: PATHS.signup }">Sign Up</NuxtLink>
      </div>
      <div class="flex flex-col text-center mt-4">
        <span class="font-main text-gray text-sm text-paragraph">Forgot the password?</span>
        <NuxtLink class="text-sm font-bold text-on-light underline" :to="{ path: PATHS.resetpassword }">Reset password
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<style scoped></style>