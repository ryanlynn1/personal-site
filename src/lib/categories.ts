export type BlogCategory =
  | 'ai-strategy'
  | 'implementation'
  | 'industry-insights'
  | 'case-analysis'
  | 'leadership'
  | 'news';

export const categoryLabels: Record<BlogCategory, string> = {
  'ai-strategy': 'AI Strategy',
  implementation: 'Implementation',
  'industry-insights': 'Industry Insights',
  'case-analysis': 'Case Analysis',
  leadership: 'Leadership',
  news: 'News & Updates',
};

export function categoryLabel(category: string): string {
  return categoryLabels[category as BlogCategory] ?? category;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
