<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { INotification } from "~/store/notification.store";

const props = defineProps<{ n: INotification }>();
const emit = defineEmits<{ close: [id: number] }>();

const paused = ref(false);
const leaving = ref(false);

let timer: ReturnType<typeof setTimeout> | null = null;
let remaining = props.n.ttl;
let startedAt = 0;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function startTimer() {
  clearTimer();
  startedAt = Date.now();
  timer = setTimeout(dismiss, remaining);
}

function dismiss() {
  clearTimer();
  leaving.value = true;
  // wait for the slide-out animation before removing from the store
  setTimeout(() => emit("close", props.n.id), 200);
}

function pause() {
  if (leaving.value) return;
  paused.value = true;
  clearTimer();
  remaining -= Date.now() - startedAt;
}

function resume() {
  if (leaving.value) return;
  paused.value = false;
  startTimer();
}

onMounted(startTimer);
onBeforeUnmount(clearTimer);

const isError = computed(() => props.n.type === "negative");
const typeClass = computed(() => (isError.value ? "t-error" : "t-success"));
const glyph = computed(() => (isError.value ? "✕" : "✓"));

// title is optional — when absent, the message becomes the primary line
const primary = computed(() => props.n.title || props.n.message);
const secondary = computed(() => (props.n.title ? props.n.message : ""));
</script>

<template>
  <div
    class="toast pointer-events-auto relative flex items-start gap-3 overflow-hidden"
    :class="[typeClass, { live: !leaving, leaving, paused }]"
    :style="{ '--ttl': n.ttl + 'ms' }"
    role="status"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <span
      class="t-ic shrink-0 w-[26px] h-[26px] grid place-items-center font-main font-bold text-sm leading-none mt-px"
    >{{ glyph }}</span>

    <div class="flex-1 min-w-0">
      <div class="font-main font-semibold text-sm text-on-light">{{ primary }}</div>
      <div
        v-if="secondary"
        class="text-[12.5px] leading-[1.45] text-on-semi-light mt-0.5"
      >
        {{ secondary }}
      </div>
    </div>

    <button
      class="shrink-0 w-5 h-5 text-lg leading-none bg-transparent border-0 text-gray cursor-pointer transition hover:text-on-light"
      aria-label="close"
      @click="dismiss"
    >
      ×
    </button>

    <div class="t-bar"><i /></div>
  </div>
</template>

<style scoped>
/* glassmorphism surface + per-type accent — var-driven, not expressible as utilities */
.toast {
  --accent: var(--on-light);
  padding: 0.9rem 0.9rem 0.9rem 1rem;
  background: color-mix(in srgb, var(--on-semi-dark) 55%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  backdrop-filter: blur(18px) saturate(150%);
  border-left: 3px solid var(--accent);
  box-shadow: 0 14px 42px rgba(0, 0, 0, 0.42);
}
.toast::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent) 18%, transparent),
    transparent 40%
  );
}
.toast > * {
  position: relative;
}

/* enter / leave */
.toast.live {
  animation: toast-in 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.toast.leaving {
  animation: toast-out 0.2s forwards;
}
@keyframes toast-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes toast-out {
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* icon chip — color is accent-driven */
.t-ic {
  background: var(--accent);
  color: var(--on-dark);
}

/* bottom progress bar — gray, inset from the left line */
.t-bar {
  position: absolute;
  left: 1rem;
  right: 0;
  bottom: 0;
  height: 3px;
  background: color-mix(in srgb, var(--on-light) 10%, transparent);
}
.t-bar i {
  display: block;
  height: 100%;
  width: 100%;
  transform-origin: left;
  background: var(--gray);
}
.toast.live .t-bar i {
  animation: toast-deplete var(--ttl, 3500ms) linear forwards;
}
.toast.paused .t-bar i {
  animation-play-state: paused;
}
@keyframes toast-deplete {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* accents — left line + icon carry the type color */
.t-success {
  --accent: var(--positive);
}
.t-success .t-ic {
  color: #06371f;
}
.t-error {
  --accent: var(--negative);
}
.t-error .t-ic {
  color: #fff;
}
</style>
