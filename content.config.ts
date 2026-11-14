import { resolve } from "node:path";
import { defineCollection, defineContentConfig, z } from "@nuxt/content";

// Local preview: CONTENT_LOCAL_PATH=../content bun run dev
// Without it, content is fetched from the GitHub repository (production behaviour).
const localContentPath = process.env.CONTENT_LOCAL_PATH;

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: localContentPath
        ? {
            cwd: resolve(localContentPath),
            include: "**/*.md",
            exclude: ["codes/**", "tools/**", "CLAUDE.md", "CONTENT.md", "TOPICS.md", "README.md"],
            prefix: "/",
          }
        : {
            repository: "https://github.com/frontend-legends/content",
            include: "**",
            // codes/ holds the runnable checks for the book's examples, not pages
            exclude: ["codes/**", "tools/**", "CLAUDE.md", "CONTENT.md", "TOPICS.md", "README.md"],
            prefix: "/",
          },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        author: z.string().optional(),
        date: z.date().optional(),
        // date of the last fact-check pass (content standard v2)
        reviewed: z.date().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        order: z.number(),
      }),
    }),
  },
});
