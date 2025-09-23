<template>
  <code class="inline-block font-main text-on-semi-light bg-on-semi-dark px-1 rounded">
    <slot />
  </code>
</template>
<style scoped>
code::after {
  content: "";
}

code::before {
  content: "";
}
</style>
