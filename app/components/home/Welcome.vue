<script setup lang="ts">
import { useUserData } from '@nhost/vue';

const user = useUserData();

const { data: page } = await useAsyncData("/", () => {
  return queryCollection('content')
    .where("order", "=", "0")
    .first()
});

const now = useNow();

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
    <div class="flex items-center gap-x-2">
      <Icon :name="getGreeting(String(new Date(now))).icon" />
      <h6 class="text-sm">{{ getGreeting(String(new Date(now))).message }}, {{ user?.displayName }}</h6>
    </div>
    <p class="text-xs text-gray">You started learning {{ useTimeAgo(String(user?.createdAt)) }}</p>
    <div v-if="page" class="flex flex-col gap-8 lg:flex-row">
      <div class="flex flex-col flex-1">
        <ContentRenderer :value="page" class="prose" />
      </div>
      <!-- <div class="bg-gray p-8 rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Welcome to Frontend Legends</h2>
      <p class="mb-4">This is a collection of resources and articles to help you become a better frontend developer.</p>
      <p class="mb-4">Explore the chapters and start your journey!</p>
      <NuxtLink to="/content" class="btn btn-primary">Start Exploring</NuxtLink>
      <p class="mt-4 text-sm text-gray-600">If you have any questions or suggestions, feel free to reach out!</p>
    </div> -->
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped></style>
