<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import { usersGql } from '~/api/app';
import { useAuthStore } from '~/store/auth.store';
import LINKS from '~/const/links';
import PATHS from '~/const/paths';

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);
const isAuth = computed(() => authStore.getAuth);

const { data: page } = await useAsyncData("/", () => {
  return queryCollection('content')
    .where("order", "=", "0")
    .first()
});

// expose frontmatter (order/date) to ProseH1 so the root gets its tagline
provide("contentPage", page);

const now = useNow();
const leaderboardVars = computed(() => ({
  year: new Date(now.value).getFullYear(),
  month: new Date(now.value).getMonth() + 1,
  limit: 10,
}));

const { result, loading, error } = useQuery(usersGql.MONTHLY_LEADERBOARD, leaderboardVars);

const users = computed(() => result.value?.monthly_leaderboard || []);

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const storiesLen = computed(() => authStore.getUserStoriesLen);

const formattedCreatedAt = computed(() => {
  const ts = user.value?.createdAt;
  if (!ts) return null;

  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});
</script>
<template>
  <div>
    <!-- fractal glass refraction filter -->
    <svg width="0" height="0" aria-hidden="true" style="position: absolute">
      <filter id="fl-fractal" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.022 0.006" numOctaves="3" seed="11" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G"
          result="disp" />
        <feGaussianBlur in="disp" stdDeviation="0 16" />
      </filter>
    </svg>

    <div class="fl-hero relative my-8 flex items-center justify-center overflow-hidden min-h-[340px]">
      <div class="fractal" aria-hidden="true">
        <div class="fractal-color" />
        <div class="flutes" />
        <div class="vignette" />
      </div>
      <pre
        class="ascii relative z-2 overflow-x-auto max-w-[640px] mx-auto text-center text-[1.5vw] bg-transparent lg:text-1rem">

    ______                 __                 __               
   / ____/________  ____  / /____  ____  ____/ /               
  / /_  / ___/ __ \/ __ \/ __/ _ \/ __ \/ __  /                
 / __/ / /  / /_/ / / / / /_/  __/ / / / /_/ /                 
/_/   /_/   \____/_/ /_/\__/\___/_/ /_/\__,_/            __    
                        / /   ___  ____ ____  ____  ____/ /____
                       / /   / _ \/ __ `/ _ \/ __ \/ __  / ___/
                      / /___/  __/ /_/ /  __/ / / / /_/ (__  ) 
                     /_____/\___/\__, /\___/_/ /_/\__,_/____/  
                                /____/                         
      </pre>
    </div>
    <div class="flex gap-y-4 gap-x-24" v-if="page">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex flex-col flex-1">
          <ContentRenderer :value="page" class="prose" />
        </div>
      </div>

      <div class="flex flex-col gap-4 flex-1 lg:sticky right-0 top-[100px] min-w-[280px] h-fit">
        <div class="flex flex-col gap-4 border border-solid border-on-semi-dark p-8">
          <!-- authed: greeting + progress -->
          <template v-if="isAuth">
            <div class="flex flex-col">
              <div class="flex items-center gap-x-2">
                <Icon :name="getGreeting(String(new Date(now))).icon" />
                <h6 class="text-sm text-gray">{{ getGreeting(String(new Date(now))).message }}, {{ user?.displayName ||
                  'Guest'
                  }}
                </h6>
              </div>
              <p class="text-xs text-gray" v-if="formattedCreatedAt">Вы начали свой путь {{ formattedCreatedAt }}
              </p>
            </div>

            <p class="text-lg">Завершено глав: {{ storiesLen || 0 }}</p>
          </template>

          <!-- guest: sign-in CTA -->
          <div v-else class="flex flex-col gap-3">
            <div class="flex items-center gap-x-2">
              <Icon name="ph:rocket-launch-bold" />
              <h6 class="text-sm font-sans">Отслеживайте прогресс</h6>
            </div>
            <p class="text-xs text-gray font-sans leading-relaxed">
              Войдите, чтобы отмечать пройденные главы и подниматься в рейтинге.
            </p>
            <q-btn color="primary" :to="PATHS.signin" no-caps class="mt-1">
              <Icon name="ph:arrow-right-bold" class="mr-2" />
              <span class="uppercase" style="font-variant: sub">sign in</span>
            </q-btn>
          </div>

          <hr class="h-px w-full text-semi-gray bg-semi-gray border-0 my-2" />
          <div>
            <h5 class="text-base text-gray mb-4">
              Топ активных за {{ useDateFormat(now, "MMMM", { locales: "ru" }) }}
            </h5>

            <div v-if="loading" class="text-xs text-gray">Загрузка...</div>
            <div v-else-if="error" class="text-xs text-red">Ошибка загрузки</div>
            <div v-else-if="users.length" class="flex flex-col gap-3">
              <div v-for="u in users" :key="u.user.id" class="flex items-center gap-3">
                <div class="text-gray">#{{ u.rank }}</div>
                <span class="w-8 h-8 grid place-items-center bg-on-semi-dark border border-solid border-semi-gray text-xs font-bold shrink-0">
                  {{ initials(u.user.name) }}
                </span>
                <div class="flex flex-col">
                  <span class="text-base font-bold">{{ u.user.name }}</span>
                  <span class="text-xs text-gray">{{ u.stories_finished }} завершено</span>
                </div>
              </div>
            </div>
            <div v-else>
              <span>Здесь еще никого нет</span>
            </div>
          </div>
        </div>

        <q-btn color="primary" :href="LINKS.telegram" target="_blank" rel="noopener">
          <Icon name="mynaui:brand-telegram" class="mr-2 text-xl" />
          <span class="uppercase" style="font-variant: sub">telegram</span>
        </q-btn>
        <q-btn class="bg-on-light text-on-dark" :href="LINKS.github" target="_blank" rel="noopener">
          <Icon name="mynaui:brand-github" class="mr-2 text-xl" />
          <span class="uppercase" style="font-variant: sub">github</span>
        </q-btn>
      </div>
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped>
/* ---- fractal glass hero background (ASCII is untouched) ---- */
.fractal {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* aurora glow — soft drifting primary-blue blobs that fade to transparent well
   before the edges, so the page background shows through continuously (no panel
   bg, no rectangular seam, nothing to mismatch during a theme switch). Primary
   only — no secondary tint. */
.fractal-color {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(38% 48% at 36% 40%,
      color-mix(in srgb, var(--primary) 50%, transparent),
      transparent 62%),
    radial-gradient(34% 44% at 66% 58%,
      color-mix(in srgb, var(--semi-primary) 40%, transparent),
      transparent 64%),
    radial-gradient(30% 40% at 54% 30%,
      color-mix(in srgb, var(--primary) 22%, transparent),
      transparent 60%);
  filter: blur(34px);
  opacity: 0.8;
  will-change: transform;
  animation: hero-drift 14s ease-in-out infinite alternate;
}
@keyframes hero-drift {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1);    }
  50%  { transform: translate3d( 2%,  1%, 0) scale(1.08); }
  100% { transform: translate3d( 1%, -2%, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .fractal-color { animation: none; }
}

/* reeded texture + vignette no longer used — the glow blends edge-to-edge
   with the page background, so these overlays render nothing */
.flutes,
.vignette {
  display: none;
}

</style>
