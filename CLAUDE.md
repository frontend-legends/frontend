# Frontend Legends

Interview preparation reference guide for frontend developers/engineers. Primarily in Russian. Live at [frontend-legends.com](https://frontend-legends.com/).

## Tech Stack

- **Nuxt 4** (SPA mode, `ssr: false`) + **Vue 3**
- **@nuxt/content v3** - markdown-driven content, fetched from [github.com/frontend-legends/content](https://github.com/frontend-legends/content)
- **Quasar UI** (via `nuxt-quasar-ui`) - component library
- **UnoCSS** (Uno preset + web fonts + typography) - utility CSS
- **Pinia** - state management
- **VueUse** - composables
- **Apollo Client** - GraphQL to backend API (`api.frontend-legends.com`)
- **TypeScript** throughout

## Project Structure

```
app/
  api/            # Client-side API layer (Apollo/GraphQL)
  components/     # Vue components (app/, auth/, chapter/, content/, home/, story/)
  composables/    # useModal, usePageProgress, useTheme, useValidation
  const/          # Constants (paths, etc.)
  layouts/        # default.vue, auth.vue
  pages/          # home.vue, chapter.vue, story.vue, auth/*
  store/          # Pinia stores (*.store.ts)
  styles/         # reset.css, app.css
  types/          # TypeScript types
  utils/          # Helpers (groupContent, etc.)
content/          # Fetched at build from github.com/frontend-legends/content (gitignored)
```

## Content Structure

All content lives in `content/` and is served by `@nuxt/content`. Three levels:

1. **Root** - `content/index.md` (landing/intro page)
2. **Module index** - `content/{NN.module-name}/0.index.md` (module overview)
3. **Topic page** - `content/{NN.module-name}/{N.topic-slug}.md` (actual lesson)

### Content file conventions

- Directories are numbered-prefixed: `01.computer-science`, `07.javascript`, etc.
- Files are numbered-prefixed: `0.index.md`, `1.introduction.md`, `2.data-types.md`
- Every `.md` file has YAML frontmatter:
  ```yaml
  ---
  title: "Topic Title"
  date: 2025-11-02
  order: 1.01 # section.topic - used for sorting
  ---
  ```
- `order` format: integer part = section number, decimal part = topic order within section
- Content is written in **Russian** with English technical terms
- Code examples use **TypeScript** (primarily), SQL, and other langs as needed
- HTML classes are used for styling: `<b class="text-on-semi-light">`, etc.
- Cross-references use absolute content paths: `[link text](/content/module-name/topic-slug)`

### Content schema (content.config.ts)

```ts
z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  date: z.date().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  order: z.number(), // required
});
```

## Commands

```bash
bun run dev        # Dev server (with --host)
bun run build      # Production build
bun run generate   # Static generation
bun run preview    # Preview production build
```

## Style & Conventions

- UnoCSS utility classes (not Tailwind) - custom theme colors via CSS variables (`--primary`, `--secondary`, `--light`, `--dark`, etc.)
- Fonts: Space Grotesk (main), Inter (sans) via Bunny provider
- Quasar components with project-wide defaults (square buttons, no caps, outlined inputs)
- ESLint via `@nuxt/eslint`
- Page transitions enabled (`page-fade`, out-in)
- Experimental: view transitions, write early hints

## Content Guidelines

- This is a **concise reference**, not a textbook - keep content brief and to the point
- Target audience: frontend devs with 1+ year experience preparing for interviews
- Structure: key concept, examples, code snippets, links to related sections
- New content should follow existing numbering and frontmatter conventions
- The `order` field is critical for navigation - maintain sequential ordering within modules
