<script setup lang="ts">
import PATHS from "~/const/paths";

definePageMeta({
  layout: "auth",
  name: "redirecting",
  path: PATHS.redirecting,
});

const route = useRoute();

type State = "processing" | "success" | "error";
const state = ref<State>("processing");
const errorMsg = ref("Токен авторизации не получен. Попробуйте войти ещё раз.");

onMounted(async () => {
  const token = route.query.token;

  if (token && typeof token === "string") {
    try {
      localStorage.setItem("auth_token", token);
      state.value = "success";

      // brief pause so the success animation is visible before redirect
      setTimeout(() => navigateTo(PATHS.home), 1200);
    } catch (err) {
      state.value = "error";
      errorMsg.value = String(err) || "Что-то пошло не так при авторизации.";
    }
  } else {
    state.value = "error";
  }
});

const title = computed(
  () =>
    ({
      processing: "Завершаем вход…",
      success: "С возвращением",
      error: "Не удалось войти",
    })[state.value],
);

const sub = computed(
  () =>
    ({
      processing:
        "Устанавливаем сессию и подгружаем ваш прогресс. Это займёт пару секунд.",
      success: "Вход выполнен. Перенаправляем на главную…",
      error: errorMsg.value,
    })[state.value],
);
</script>

<template>
  <AuthPanel :title="title">
    <template #lead>{{ sub }}</template>

    <!-- status: one hairline. processing sweeps, success fills, error stays red -->
    <div class="fl-status" :class="`is-${state}`" role="status" :aria-label="title">
      <span class="fl-status__fill" />
    </div>

    <div v-if="state === 'error'" class="fl-status__action">
      <AuthSubmit :to="PATHS.signin">Вернуться ко входу</AuthSubmit>
    </div>
  </AuthPanel>
</template>

<style scoped>
.fl-status {
  position: relative;
  height: 2px;
  margin-top: 2rem;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--on-light) 14%, transparent);
}

.fl-status__fill {
  position: absolute;
  inset: 0;
  background-color: var(--on-light);
  transform-origin: left;
}

.is-processing .fl-status__fill {
  transform: scaleX(0.35);
}

.is-success .fl-status__fill {
  background-color: var(--positive);
}

.is-error .fl-status__fill {
  background-color: var(--negative);
}

.fl-status__action {
  margin-top: 2rem;
}

@media (prefers-reduced-motion: no-preference) {
  .is-processing .fl-status__fill {
    animation: fl-status-sweep 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  .is-success .fl-status__fill {
    animation: fl-status-fill 0.5s cubic-bezier(0.65, 0, 0.35, 1) both;
  }
}

@keyframes fl-status-sweep {
  from {
    transform: translateX(-100%) scaleX(0.35);
  }
  to {
    transform: translateX(100%) scaleX(0.35);
  }
}

@keyframes fl-status-fill {
  from {
    transform: scaleX(0);
  }
}
</style>
