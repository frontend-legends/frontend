<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

// Desktop only (xl+): below xl the outline lives in the menu (AppMenu).

const route = useRoute()

const link = computed(() => {
  return route.name === 'chapter'
    ? `/${route.params.chapter}`
    : `/${route.params.chapter}/${route.params.story}` as string
});

const cats = await useAsyncData(route.path, () => {
  return queryCollection('content')
    .path(link.value)
    .first()
});

const author = computed(() => cats.data.value?.author)

const { items, activeIds, isActive } = useStoryToc(cats.data)

/*
** Rail geometry (desktop): an SVG path that follows the item boxes, shifted right for h3
** with a short diagonal between levels. The active part is a "thumb" masked by the same path.
*/
const RAIL_X = { 2: 1, 3: 13 } as const
const RAIL_W = 16
const listEl = ref<HTMLElement | null>(null)
const geom = ref({ d: '', h: 0, tops: [] as number[], bottoms: [] as number[] })

function measure() {
  const list = listEl.value
  if (!list) return
  const links = [...list.querySelectorAll<HTMLElement>('.toc-link')]
  if (!links.length) return

  const tops = links.map((l) => l.offsetTop)
  const bottoms = links.map((l) => l.offsetTop + l.offsetHeight)
  let d = ''

  items.value.forEach((it, i) => {
    const x = RAIL_X[it.depth]
    if (i === 0) {
      d += `M${x} ${tops[i]}`
    } else {
      const px = RAIL_X[items.value[i - 1]!.depth]
      if (px !== x) d += ` L${px} ${tops[i]} L${x} ${tops[i]! + 9}`
    }
    d += ` L${x} ${bottoms[i]}`
  })

  geom.value = { d, h: list.offsetHeight, tops, bottoms }
}

const maskStyle = computed(() => {
  const { d, h } = geom.value
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${RAIL_W}" height="${h}" viewBox="0 0 ${RAIL_W} ${h}"><path d="${d}" fill="none" stroke="black" stroke-width="2"/></svg>`
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return { width: `${RAIL_W}px`, height: `${h}px`, maskImage: url, WebkitMaskImage: url }
})

const thumb = computed(() => {
  const idx = items.value.map((it, i) => (isActive(it.id) ? i : -1)).filter((i) => i >= 0)
  if (!idx.length || !geom.value.tops.length) return { top: 0, height: 0 }
  const first = idx[0]!
  const last = idx[idx.length - 1]!
  const top = geom.value.tops[first] ?? 0
  return { top, height: (geom.value.bottoms[last] ?? top) - top }
})

let ro: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  measure()
  if (listEl.value) {
    ro = new ResizeObserver(() => measure())
    ro.observe(listEl.value)
  }
})

watch(items, async () => {
  await nextTick()
  measure()
})

onBeforeUnmount(() => {
  ro?.disconnect()
})
</script>

<template>
  <div>
    <!-- Desktop TOC -->
    <nav class="toc-container w-[320px] overflow-auto s:hidden xl:flex xl:flex-col" aria-label="Содержание">
      <div v-if="cats.data.value" class="toc-head">
        <Icon name="ph:text-align-left-bold" class="toc-head__icon" aria-hidden="true" />
        <span class="toc-head__num">{{ Number(cats.data.value.order).toFixed(2) }}</span>
        <span>{{ cats.data.value.title.toLowerCase() }}</span>
      </div>

      <ol ref="listEl" class="toc-list">
        <svg class="toc-track" :width="RAIL_W" :height="geom.h" :viewBox="`0 0 ${RAIL_W} ${geom.h}`" aria-hidden="true">
          <path :d="geom.d" fill="none" />
        </svg>
        <div class="toc-thumb-mask" :style="maskStyle" aria-hidden="true">
          <div class="toc-thumb" :style="{ transform: `translateY(${thumb.top}px)`, height: `${thumb.height}px` }" />
        </div>

        <li v-for="item in items" :key="item.id">
          <NuxtLink :to="`#${item.id}`" class="toc-link" :class="[`toc-link--d${item.depth}`, { 'is-active': isActive(item.id) }]"
            :aria-current="activeIds[0] === item.id ? 'location' : undefined">
            {{ item.text }}
          </NuxtLink>
        </li>
      </ol>
    </nav>

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
}

.toc-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;

  font-family: var(--font-main);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--on-light);
}

.toc-head__icon {
  width: 15px;
  height: 15px;
  color: var(--gray);
}

.toc-head__num {
  opacity: 0.4;
}

.toc-list {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* base rail: hairline that follows the heading levels */
.toc-track {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

.toc-track path {
  stroke: color-mix(in srgb, var(--on-light) 16%, transparent);
  stroke-width: 1;
}

/* active part: a solid thumb, visible only through the rail-shaped mask */
.toc-thumb-mask {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
}

.toc-thumb {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background-color: var(--on-light);
}

.toc-link {
  display: block;
  padding: 0.38rem 0 0.38rem 22px;

  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none;
  color: var(--gray);
}

.toc-link--d3 {
  padding-left: 34px;
}

.toc-link:hover,
.toc-link.is-active {
  color: var(--on-light);
}

.toc-link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .toc-thumb {
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .toc-link {
    transition: color 0.2s ease;
  }
}

</style>
