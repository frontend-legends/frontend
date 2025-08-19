<template>
  <div class="relative group border rounded bg-on-semi-dark overflow-hidden px-8 py-2 my-4">
    <div class="absolute left-0 top-0 bottom-0 w-6px bg-primary"></div>
    <blockquote ref="blockquoteRef" class="relative m-0 ml-12px mr-26px p-0 text-on-dark">
      <span class="not-italic text-sm">
        <slot />
      </span>
    </blockquote>
  </div>
</template>
<style scoped></style>
