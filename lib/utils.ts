export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Data Insights';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_DESC =
  'Data Analytics tutorials — SQL, Python, Power BI, Excel, career guidance and interview preparation for aspiring data analysts.';

export const CATEGORY_LABELS: Record<string, string> = {
  sql: 'SQL',
  python: 'Python',
  'power-bi': 'Power BI',
  excel: 'Excel',
  career: 'Career',
  'interview-questions': 'Interview Q&A',
  'case-study': 'Case Study',
};

export const POSTS_PER_PAGE = 10;

export function readingTime(html: string): number {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptFrom(html: string, max = 220): string {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
