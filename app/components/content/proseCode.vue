<template>
  <!-- inline code: thin square chip in mono, wraps across lines like text -->
  <code class="fl-ic"><slot /></code>
</template>

<style scoped>
.fl-ic {
  display: inline;
  padding: 0.12em 0.36em;
  border-radius: 0;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;

  /* long identifiers like withAuth(withTheme(withRouter(Page))) have no spaces:
     let them break anywhere instead of pushing the page sideways on phones */
  overflow-wrap: anywhere;

  font-family: var(--font-mono);
  font-size: 0.84em;
  font-weight: 400;
  /* quieter than the text around it: the chip marks code, it shouldn't shout */
  color: color-mix(in srgb, var(--on-light) 82%, transparent);
  background-color: color-mix(in srgb, var(--on-light) 6%, transparent);
}

.fl-ic::before,
.fl-ic::after {
  content: none;
}
</style>
