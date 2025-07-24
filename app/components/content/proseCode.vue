<template>
  <code class="inline-block font-main font-bold bg-on-dark text-on-light bg-op-20 px-1 rounded">
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
