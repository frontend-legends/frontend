<script setup lang="ts">
import { useNotificationStore } from '~/store/notification.store';
import PATHS from '~/const/paths';

const { add } = useNotificationStore();
const { errors, validate } = useSignUpValidation();
const { signUp: signUpMutation, isLoading } = useSignUp();
const { signInWithGoogle, signInWithGitHub } = useOAuthSignIn();

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
  if (!validate(form.value)) return;

  const result = await signUpMutation(form.value.email, form.value.password, form.value.login);

  if (!result.success) {
    console.log(`sign-up error: ${result.error}`);

    return add({
      type: "negative",
      message: String(result.error || 'Sign up failed'),
    });
  }

  console.log(result)

  if (result.needsEmailVerification) {
    // REDIRECT TO VERIFICATION
    await navigateTo({ path: PATHS.verifyemail });
    return;
  }

  // REDIRECT TO SIGN IN
  await navigateTo({ path: PATHS.signin });
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
      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="text" label="Login" v-model="form.login"
          hint="at least 5 characters long" :error="!!errors.login" :error-message="errors.login" />
      </div>

      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="email" label="Email" v-model="form.email" :error="!!errors.email"
          :error-message="errors.email" />
      </div>

      <div class="mt-6 w-full">
        <q-input color="primary" outlined type="password" label="Password" v-model="form.password"
          hint="at least 6 characters long" :error="!!errors.password" :error-message="errors.password" />
      </div>

      <div class="mt-6 w-full">
        <q-btn :disable="!isFormFull" color="primary" class="w-full" :loading="isLoading" @click="signUp">
          <span>Sign Up</span>
        </q-btn>
      </div>
    </div>
    <div class="w-full flex items-center gap-4 my-8">
      <hr class="flex-1 border-0 bg-semi-gray text-semi-gray h-px" />
      <span class="text-xs text-gray uppercase">or sign in with</span>
      <hr class="flex-1 border-0 bg-semi-gray text-semi-gray h-px" />
    </div>
    <div class="flex gap-x-8 w-full">
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
      <span class="font-sans text-gray text-sm text-paragraph">Already have an account?</span>
      <NuxtLink class="font-main text-sm font-bold text-on-light underline" :to="{ path: PATHS.signin }">Sign In
      </NuxtLink>
    </div>
  </div>
</template>
<style scoped></style>