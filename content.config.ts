import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**",
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        author: z.string().optional(),
        date: z.date().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        order: z.number(),
      }),
    }),
  },
});
