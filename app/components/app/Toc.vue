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
    <div
      class="toc-container w-[320px] overflow-auto s:hidden xl:flex xl:flex-col">
      <h6 v-if="cats.data.value" class="text-xs font-bold uppercase mb-2">
        {{ Number(cats.data.value.order).toFixed(2) }}. {{ cats.data.value.title.toLowerCase() }}
      </h6>
      <div class="toc-el" v-for="cat of cats.data.value?.body.toc?.links" :key="cat.id">
        <NuxtLink :to="`#${cat.id}`" class="text-xs text-on-light underline-gray op-60"
          :class="{ 'underline-primary op-100!': activeId === cat.id }">
          {{ cat.text }}
        </NuxtLink>
        <ul class="toc-el" v-if="cat.children">
          <li v-for="item in cat.children" :key="item.id">
            <NuxtLink :to="`#${item.id}`" class="text-xs text-on-light underline-gray op-60"
              :class="{ 'underline-primary op-100!': activeId === item.id }">
              {{ item.text }}
            </NuxtLink>
          </li>
        </ul>
      </div>
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
          <NuxtLink :to="`#${cat.id}`" class="text-xs text-on-light underline-gray op-60"
            :class="{ 'underline-primary op-100!': activeId === cat.id }">
            {{ cat.text }}
          </NuxtLink>

          <ul v-if="cat.children">
            <li v-for="item in cat.children" :key="item.id">
              <NuxtLink :to="`#${item.id}`" class="text-xs text-on-light underline-gray op-60"
                :class="{ 'underline-primary op-100!': activeId === item.id }">
                {{ item.text }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <AppFinish />

    <div class="flex flex-col text-sm text-gray">
      <small v-if="author">Author: {{ author }}</small>
    </div>
  </div>
</template>

<style scoped>
.toc-container {
  scrollbar-width: thin;

  max-height: min(calc(100vh - 320px), 640px);
  padding-bottom: 16px;

  /* soft fade at the bottom edge so scrolled links dissolve instead of being sliced */
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);

  transition: all .2s;
}

.toc-container a {
  transition: all .2s;
}

ul {
  list-style-type: disc;
  list-style-position: inside;
}
</style>
