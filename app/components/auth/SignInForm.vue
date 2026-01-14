<script setup lang="ts">
import { useNotificationStore } from '~/store/notification.store';
import PATHS from '~/const/paths';

const { add } = useNotificationStore();
const { errors, validate } = useSignInValidation();
const { signIn: signInMutation, isLoading } = useSignIn();
const { signInWithGoogle, signInWithGitHub } = useOAuthSignIn();

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

function signInGoogle() {
  signInWithGoogle();
}

function signInGithub() {
  signInWithGitHub();
}
</script>
<template>
  <div class="flex flex-col items-center w-[340px]">
    <div class="flex flex-col items-center w-full">
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
    <div class="w-full flex items-center gap-4 my-8">
      <hr class="flex-1 border-0 bg-semi-gray text-semi-gray h-px" />
      <span class="text-xs text-gray uppercase">or sign in with</span>
      <hr class="flex-1 border-0 bg-semi-gray text-semi-gray h-px" />
    </div>
    <div class="flex gap-x-8 w-full">
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
        <span class="font-sans text-gray text-sm text-paragraph">Don't have an account?</span>
        <NuxtLink class="font-main text-sm font-bold text-on-light underline" :to="{ path: PATHS.signup }">Sign Up
        </NuxtLink>
      </div>
      <div class="flex flex-col text-center mt-4">
        <span class="font-sans text-gray text-sm text-paragraph">Forgot the password?</span>
        <NuxtLink class="font-main text-sm font-bold text-on-light underline" :to="{ path: PATHS.resetpassword }">Reset
          password
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<style scoped></style>