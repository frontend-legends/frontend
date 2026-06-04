<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import { usersGql } from '~/api/app';
import { useAuthStore } from '~/store/auth.store';
import RELEASE from '~/const/release';
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

const now = useNow();
const leaderboardVars = computed(() => ({
  year: new Date(now.value).getFullYear(),
  month: new Date(now.value).getMonth() + 1,
  limit: 10,
}));

const { result, loading, error } = useQuery(usersGql.MONTHLY_LEADERBOARD, leaderboardVars);

const users = computed(() => result.value?.monthly_leaderboard || []);

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
      <div class="fl-meta">
        <span class="fl-meta-ver">{{ RELEASE.version }}</span>
        <span class="fl-meta-upd">last updated {{ RELEASE.updated }}</span>
      </div>
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

/* soft brand-blue glow that fades fully to transparent well before the edges,
   so the page background shows through continuously — no panel bg, no rectangular
   seam, and nothing to mismatch the page bg during a theme switch */
.fractal-color {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 50% at 44% 46%,
      color-mix(in srgb, var(--primary) 32%, transparent),
      transparent 58%),
    radial-gradient(34% 44% at 62% 56%,
      color-mix(in srgb, var(--semi-primary) 20%, transparent),
      transparent 60%);
  opacity: 0.8;
}

/* reeded texture + vignette no longer used — the glow blends edge-to-edge
   with the page background, so these overlays render nothing */
.flutes,
.vignette {
  display: none;
}

/* version + last updated, bottom-right of the hero */
.fl-meta {
  position: absolute;
  right: 1rem;
  bottom: 0.85rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  font-family: var(--font-main);
  color: var(--gray);
}

.fl-meta-ver {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--on-semi-light);
}

.fl-meta-upd {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
