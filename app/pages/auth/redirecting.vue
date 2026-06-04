<script setup lang="ts">
import PATHS from "~/const/paths";

definePageMeta({
  name: "redirecting",
  path: PATHS.redirecting,
  layout: "auth",
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
      success: "С возвращением!",
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
  <div
    class="flex flex-col items-center text-center w-[380px] max-w-full border border-solid border-on-semi-dark pt-12 px-8 pb-8"
  >
    <!-- status glyph -->
    <div class="relative w-[104px] h-[104px] mb-7">
      <!-- processing -->
      <div
        v-if="state === 'processing'"
        class="absolute inset-0 grid place-items-center"
      >
        <svg viewBox="0 0 100 100" class="cb-ring absolute inset-0 w-[104px] h-[104px]">
          <circle cx="50" cy="50" r="42" class="track" />
          <circle cx="50" cy="50" r="42" class="spin" />
        </svg>
        <span class="font-main font-bold text-[22px] text-on-light">FL</span>
      </div>

      <!-- success -->
      <div
        v-else-if="state === 'success'"
        class="absolute inset-0 grid place-items-center"
      >
        <svg viewBox="0 0 100 100" class="cb-ring absolute inset-0 w-[104px] h-[104px]">
          <circle cx="50" cy="50" r="42" class="track ok" />
        </svg>
        <svg viewBox="0 0 52 52" class="check absolute w-[52px] h-[52px]">
          <path d="M14 27 l8 8 l16 -18" />
        </svg>
      </div>

      <!-- error -->
      <div v-else class="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" class="cb-ring absolute inset-0 w-[104px] h-[104px]">
          <circle cx="50" cy="50" r="42" class="track bad" />
        </svg>
        <svg viewBox="0 0 52 52" class="cross absolute w-[52px] h-[52px]">
          <path d="M17 17 L35 35 M35 17 L17 35" />
        </svg>
      </div>
    </div>

    <h4 class="text-xl mb-2">{{ title }}</h4>
    <p class="text-[13px] leading-normal max-w-[280px] text-gray mb-6">{{ sub }}</p>

    <!-- indeterminate bar — processing only -->
    <div
      v-if="state === 'processing'"
      class="w-full h-[3px] bg-semi-gray overflow-hidden"
    >
      <div class="cb-bar-fill h-full w-[40%] bg-secondary" />
    </div>

    <!-- recovery action — error only -->
    <NuxtLink
      v-if="state === 'error'"
      class="mt-5 w-full py-3 px-4 flex items-center justify-center gap-2 font-main font-semibold text-sm text-on-dark bg-on-light no-underline transition-opacity hover:op-85"
      :to="PATHS.signin"
    >
      <span>Вернуться ко входу</span>
    </NuxtLink>

    <p class="text-[10px] tracking-[0.12em] uppercase text-gray mt-5">
      {{ state === "error" ? "oauth error" : state === "success" ? "redirecting" : "не закрывайте вкладку" }}
    </p>
  </div>
</template>

<style scoped>
/* SVG strokes + keyframe animations — not expressible as Uno utilities */
.cb-ring circle {
  fill: none;
  stroke-width: 4;
}
.track {
  stroke: var(--semi-gray);
}
.track.ok {
  stroke: var(--positive);
}
.track.bad {
  stroke: var(--negative);
}

.spin {
  stroke: var(--secondary);
  stroke-linecap: square;
  stroke-dasharray: 80 184;
  transform-origin: center;
  animation: cb-ringspin 1s linear infinite;
}

.check path {
  fill: none;
  stroke: var(--positive);
  stroke-width: 5;
  stroke-linecap: square;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: cb-draw 0.4s 0.1s forwards;
}
.cross path {
  fill: none;
  stroke: var(--negative);
  stroke-width: 5;
  stroke-linecap: square;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: cb-draw 0.35s 0.1s forwards;
}

.cb-bar-fill {
  animation: cb-indet 1.1s ease-in-out infinite;
}

@keyframes cb-ringspin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes cb-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes cb-indet {
  0% {
    margin-left: -40%;
  }
  100% {
    margin-left: 100%;
  }
}
</style>
