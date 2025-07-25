<template>
  <code class="inline-block font-main font-bold bg-semi-light px-1 rounded">
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
