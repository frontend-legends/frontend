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
    </div>
    <AppNotFound v-else />
  </div>
</template>
<style scoped></style>
