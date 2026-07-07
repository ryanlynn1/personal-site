import type { CollectionEntry } from 'astro:content';
import { site, social } from '../data/site';
import { categoryLabel } from './categories';

// Normalize to non-trailing-slash URLs (except root) to match the sitemap and Vercel's serving.
const abs = (path: string) => new URL(path.replace(/(.)\/$/, '$1'), site.url).href;

const AUTHOR = {
  '@type': 'Person',
  name: site.name,
  url: site.url,
};

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    image: abs(site.avatar),
    jobTitle: 'Founder',
    worksFor: {
      '@type': 'Organization',
      name: 'IntelligentNoise',
      url: 'https://intelligentnoise.ai',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Michigan – Stephen M. Ross School of Business',
    },
    knowsAbout: ['AI agents', 'Enterprise AI', 'Go-to-market', 'Revenue teams', 'Software'],
    sameAs: [social.linkedin, social.twitter, social.github],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'en',
    author: AUTHOR,
  };
}

export function blogPostingSchema(entry: CollectionEntry<'blog'>, pathname: string) {
  const { data } = entry;
  const url = abs(pathname);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.metaDescription ?? data.excerpt,
    datePublished: data.publishedAt.toISOString(),
    dateModified: (data.updatedAt ?? data.publishedAt).toISOString(),
    author: AUTHOR,
    publisher: AUTHOR,
    image: abs(site.ogImage),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: categoryLabel(data.category),
    keywords: (data.tags ?? []).join(', '),
    timeRequired: `PT${data.readTimeMinutes}M`,
    inLanguage: 'en',
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function blogSchema(entries: CollectionEntry<'blog'>[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${site.name} — Writing`,
    url: abs('/posts'),
    description: site.description,
    author: AUTHOR,
    blogPost: entries.map((e) => ({
      '@type': 'BlogPosting',
      headline: e.data.title,
      description: e.data.excerpt,
      datePublished: e.data.publishedAt.toISOString(),
      url: abs(`/posts/${e.id}`),
    })),
  };
}
