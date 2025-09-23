<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const route = useRoute()

const link = computed(() => {
  return route.name === 'chapter'
    ? `/${route.params.chapter}`
    : `/${route.params.chapter}/${route.params.story}` as string
});

const chapter = computed(() => route.params.chapter as string);
const story = computed(() => route.params?.story as string | undefined);

const cats = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
});

const author = computed(() => cats.data.value?.author)
const date = computed(() => cats.data.value?.date)

const isFinished = ref(false)

const activeId = ref<string | null>(null)

function getSectionElements(): HTMLElement[] {
  const ids: string[] = []
  cats.data.value?.body.toc?.links?.forEach((cat: any) => {
    if (cat.id) ids.push(cat.id)
    cat.children?.forEach((child: any) => {
      if (child.id) ids.push(child.id)
    })
  })

  const els = ids
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)
  return els
}

let observer: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()

  const sections = getSectionElements()
  if (sections.length === 0) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => {
          return (a.boundingClientRect.top) - (b.boundingClientRect.top)
        })

      if (visible.length > 0) {
        activeId.value = visible[0]?.target.id || null
      }
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -70% 0px'
    }
  )

  sections.forEach(el => observer?.observe(el))
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div>
    <!-- Desktop TOC -->
    <div class="toc-container s:hidden xl:flex xl:flex-col">
      <h6 class="text-sm mb-2">Table of contents</h6>
      <div v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
        <NuxtLink :to="`#${cat.id}`" class="text-gray underline-light"
          :class="{ 'text-on-light underline-primary': activeId === cat.id }">
          {{ cat.text }}
        </NuxtLink>
        <ul v-if="cat.children">
          <li v-for="item in cat.children" :key="item.id">
            <NuxtLink :to="`#${item.id}`" class="text-gray underline-light"
              :class="{ 'text-on-light underline-primary': activeId === item.id }">
              {{ item.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <q-btn color="primary" :outline="!isFinished" class="w-full mt-4">
        <span>{{ isFinished ? 'Unfinish' : 'Finish' }}</span>
      </q-btn>
    </div>

    <!-- Mobile TOC -->
    <div class="s:flex flex-col justify-between gap-4 md:flex-row xl:hidden">
      <div class="flex flex-col">
        <div class="flex flex-col mb-4">
          <q-breadcrumbs active-color="gray" gutter="sm" class="text-xs font-main lowercase" separator-color="gray"
            separator="-">
            <q-breadcrumbs-el label="home" to="/"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el :label="chapter" :to="`/content/${chapter}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
            <q-breadcrumbs-el v-if="story" :label="story" :to="`/content/${chapter}/${story}`"
              class="font-main underline underline-transparent transition hover:text-on-light hover:underline-primary" />
          </q-breadcrumbs>
        </div>

        <div v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
          <NuxtLink :to="`#${cat.id}`" class="text-gray" :class="{ 'text-primary font-bold': activeId === cat.id }">
            {{ cat.text }}
          </NuxtLink>

          <ul v-if="cat.children">
            <li v-for="item in cat.children" :key="item.id">
              <NuxtLink :to="`#${item.id}`" class="text-gray"
                :class="{ 'text-primary font-bold': activeId === item.id }">
                {{ item.text }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <q-btn color="primary" :outline="!isFinished" class="h-fit">
        <span>{{ isFinished ? 'Unfinish' : 'Finish' }}</span>
      </q-btn>
    </div>

    <!-- Author & date -->
    <div class="flex flex-col text-sm text-gray">
      <small v-if="author">Author: {{ author }}</small>
      <small v-if="date">Last edited: {{ useDateFormat(date, 'DD MMM YYYY - HH:MM') }}</small>
    </div>
  </div>
</template>

<style scoped>
.toc-container a {
  transition: all .2s;
}

ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
