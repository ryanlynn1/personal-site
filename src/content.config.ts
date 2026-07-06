import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.enum([
      'ai-strategy',
      'implementation',
      'industry-insights',
      'case-analysis',
      'leadership',
      'news',
    ]),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Ryan Lynn'),
    authorTitle: z.string().optional(),
    authorAvatar: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    readTimeMinutes: z.number().default(0),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const collections = { blog };
