<template>
  <div class="relative group border rounded bg-on-semi-dark px-8 py-2 my-4">
    <div class="absolute left-4 top-4 bottom-4 w-4px bg-on-semi-light rounded"></div>
    <blockquote ref="blockquoteRef" class="relative m-0 ml-12px mr-26px p-0 text-on-dark text-sm">
      <slot />
    </blockquote>
  </div>
</template>
<style scoped></style>
