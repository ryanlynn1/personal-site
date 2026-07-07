import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';
import { categoryLabel, formatDate } from '../lib/categories';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push('');
  lines.push(`> ${site.description}`);
  lines.push('');
  lines.push(
    "Ryan Lynn is the founder of IntelligentNoise — the AI platform for revenue teams. " +
      "After seven years in enterprise consulting and software sales (Grant Thornton, then SS&C Intralinks, " +
      "where he was named Sales Rep of the Year) and an MBA in Artificial Intelligence at the University of " +
      "Michigan's Ross School of Business, he now builds and writes about production AI agents. This site " +
      "collects his essays on building production AI agents, real-world implementation, and what's next."
  );
  lines.push('');
  lines.push('## Pages');
  lines.push(`- [Home](${site.url}/): Introduction, the latest essay, recent posts, and Ryan's work history.`);
  lines.push(`- [Posts](${site.url}/posts): The full archive of essays, filterable by topic and grouped by year.`);
  lines.push(`- [Newsletter](${site.url}/newsletter): Field notes on production AI agents — coming soon.`);
  lines.push('');
  lines.push('## Posts');
  for (const p of posts) {
    lines.push(
      `- [${p.data.title}](${site.url}/posts/${p.id}): ${p.data.excerpt} ` +
        `(${categoryLabel(p.data.category)} · ${formatDate(p.data.publishedAt)} · ${p.data.readTimeMinutes} min read)`
    );
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
