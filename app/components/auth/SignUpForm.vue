<script setup lang="ts">
import { useNhostClient, useSignUpEmailPassword } from '@nhost/vue';
import { useAuthStore } from '~/store/auth.store';
import { useNotificationStore } from '~/store/notification.store';
import type { IAuthStoreUser } from '~/types/user.type';
import PATHS from '~/const/paths';

const authStore = useAuthStore();
const { nhost } = useNhostClient();
const { add } = useNotificationStore();
const { errors, validate } = useSignUpValidation();

const {
  signUpEmailPassword,
  needsEmailVerification,
  isLoading,
  isSuccess,
  isError,
  error,
  user,
} = useSignUpEmailPassword();

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
    form.value.password.length > 4
    ? true
    : false,
);

async function signUp() {
  if (!validate(form.value)) return

  await signUpEmailPassword(form.value.email, form.value.password, {
    displayName: form.value.login,
  });

  if (isError.value) {
    console.log(
      error.value
        ? `sign-up error (${error.value?.status}): ${error.value?.message}`
        : `sign-up error`,
    );

    return add({
      type: "negative",
      message: String(
        error.value
          ? `sign-up error: ${error.value?.message}`
          : `sign-up error`,
      ),
    });
  }

  if (needsEmailVerification.value) {
    // SET USER STORE
    authStore.setUser(user.value as unknown as IAuthStoreUser);

    // REDIRECT TO VERIFICATION
    await navigateTo({ path: PATHS.verifyemail });
  }

  if (isSuccess.value) {
    await navigateTo({ path: PATHS.signin });
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
      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="text" label="Login" v-model="form.login"
          hint="At least 5 characters long" :error="!!errors.login" :error-message="errors.login" />
      </div>

      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="email" label="Email" v-model="form.email" :error="!!errors.email"
          :error-message="errors.email" />
      </div>

      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="password" label="Password" v-model="form.password"
          hint="At least 6 characters long" :error="!!errors.password" :error-message="errors.password" />
      </div>

      <div class="mt-6 w-full">
        <q-btn :disable="!isFormFull" color="primary" class="w-full" :loading="isLoading" @click="signUp">
          <span>Sign Up</span>
        </q-btn>
      </div>
    </div>

    <div class="flex gap-x-8 w-full mt-8">
      <q-btn outline class="flex-1" @click="signInGoogle" :disable="true">
        <Icon name="ph:google-logo-bold" class="mr-2" />
        <span>Google</span>
      </q-btn>
      <q-btn outline class="flex-1" @click="signInGithub">
        <Icon name="ph:github-logo-bold" class="mr-2" />
        <span>Github</span>
      </q-btn>
    </div>
    <div class="flex flex-col text-center mt-4">
      <span class="font-main text-gray text-sm text-paragraph">Already have an account?</span>
      <NuxtLink class="text-sm font-bold text-on-light underline" :to="{ path: PATHS.signin }">Sign In</NuxtLink>
    </div>
  </div>
</template>
<style scoped></style>