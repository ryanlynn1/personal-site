import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const latest =
    posts.length > 0 ? posts[0].data.updatedAt ?? posts[0].data.publishedAt : undefined;

  const entries: Entry[] = [
    { loc: '/', lastmod: latest ? iso(latest) : undefined, changefreq: 'weekly', priority: '1.0' },
    { loc: '/posts', lastmod: latest ? iso(latest) : undefined, changefreq: 'weekly', priority: '0.9' },
    { loc: '/newsletter', changefreq: 'monthly', priority: '0.3' },
    ...posts.map((p) => ({
      loc: `/posts/${p.id}`,
      lastmod: iso(p.data.updatedAt ?? p.data.publishedAt),
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map((e) => {
        const loc = new URL(e.loc, site.url).href;
        return (
          `  <url>\n` +
          `    <loc>${loc}</loc>\n` +
          (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
          (e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>\n` : '') +
          (e.priority ? `    <priority>${e.priority}</priority>\n` : '') +
          `  </url>`
        );
      })
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
