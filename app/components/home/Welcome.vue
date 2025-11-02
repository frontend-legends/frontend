<script setup lang="ts">
import { useUserData } from '@nhost/vue';
import { useQuery } from '@vue/apollo-composable';
import { usersGql } from '~/api/app';
import { useAuthStore } from '~/store/auth.store';

const $q = useQuasar();
const user = useUserData();

const { data: page } = await useAsyncData("/", () => {
  return queryCollection('content')
    .where("order", "=", "0")
    .first()
});

const { result, loading, error } = useQuery(usersGql.RANKING);

const users = computed(() => result.value?.users_monthly_activity || []);

const now = useNow();

const authStore = useAuthStore();

const storiesLen = computed(() => authStore.getUserStoriesLen);
</script>
<template>
  <div>
    <pre class="overflow-x-auto max-w-[640px] mx-auto my-8 text-center text-[1.5vw] bg-transparent lg:text-1rem">

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
    <div class="flex gap-y-4 gap-x-24" v-if="page">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex flex-col flex-1">
          <ContentRenderer :value="page" class="prose" />
        </div>
      </div>

      <div class="flex flex-col gap-4 flex-1 lg:sticky right-0 top-[100px] min-w-[280px] h-fit">
        <div class="flex flex-col gap-4 border border-solid border-on-semi-dark p-8">
          <div class="flex flex-col">
            <div class="flex items-center gap-x-2">
              <Icon :name="getGreeting(String(new Date(now))).icon" />
              <h6 class="text-sm text-gray">{{ getGreeting(String(new Date(now))).message }}, {{ user?.displayName
              }}
              </h6>
            </div>
            <p class="text-xs text-gray">Вы начали свой путь {{ useDateFormat(String(user?.createdAt), "YYYY-MM-DD") }}
            </p>
          </div>

          <p class="text-lg">Завершено глав: {{ storiesLen || 0 }}</p>

          <hr class="h-px w-full text-semi-gray bg-semi-gray border-0 my-2" />
          <div>
            <h5 class="text-base text-gray mb-4">
              Топ активных за {{ useDateFormat(now, "MMMM", { locales: "ru" }) }}
            </h5>

            <div v-if="loading" class="text-xs text-gray">Загрузка...</div>
            <div v-else-if="error" class="text-xs text-red">Ошибка загрузки</div>
            <div v-else class="flex flex-col gap-3">
              <div v-for="(u, idx) in users" :key="u.id" class="flex items-center gap-3">
                <div class="text-gray">#{{ idx + 1 }}</div>
                <img :src="u.avatar_url" alt=""
                  class="w-10 h-10 rounded-full border border-solid border-gray object-cover" />
                <div class="flex flex-col">
                  <span class="text-base font-bold">{{ u.display_name }}</span>
                  <span class="text-xs text-gray">{{ u.story_finished }} завершено</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <q-btn color="semi-gray">
          <Icon name="mynaui:brand-telegram" class="mr-2" />
          <span>telegram</span>
        </q-btn>
        <q-btn color="semi-gray">
          <Icon name="mynaui:brand-github" class="mr-2" />
          <span>github</span>
        </q-btn>
      </div>
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped></style>
