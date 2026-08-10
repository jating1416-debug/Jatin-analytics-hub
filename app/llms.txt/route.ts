import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/utils';

// llms.txt - AI agents (ChatGPT, Gemini, Claude) ke liye site ka map
// Standard: https://llmstxt.org/
// Ye file AI ko batati hai ki site kya hai + saare important links
// Lighthouse "llms.txt follows recommendations" audit bhi pass karega

export const revalidate = 300;

export async function GET() {
  let categories: any[] = [];
  let articles: any[] = [];
  let tools = [
    { name: 'KPI Calculator', url: '/tools/kpi-calculator' },
    { name: 'CAGR Calculator', url: '/tools/cagr-calculator' },
    { name: 'SQL Playground', url: '/tools/sql-playground' },
    { name: 'ATS Resume Scanner', url: '/tools/ats-scanner' },
    { name: 'JSON Formatter', url: '/tools/json-formatter' },
  ];

  try {
    categories = await prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });
  } catch (e) { console.error('llms categories error:', e); }

  try {
    articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
  } catch (e) { console.error('llms articles error:', e); }

  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push('> Data Analytics tutorials — SQL, Python, Power BI, Excel aur career guidance. Practical examples ke saath, 100% free.');
  lines.push('');
  lines.push('## Important URLs');
  lines.push('');
  lines.push(`- [Home](${SITE_URL}/)`);
  lines.push(`- [All Tools](${SITE_URL}/tools)`);
  lines.push(`- [Archive](${SITE_URL}/archive)`);
  lines.push(`- [Search](${SITE_URL}/search)`);
  lines.push('');
  lines.push('## Categories');
  lines.push('');
  categories.forEach((c: any) => {
    lines.push(`- [${c.name} (${c._count.articles} posts)](${SITE_URL}/category/${c.slug})`);
  });
  lines.push('');
  lines.push('## Free Tools');
  lines.push('');
  tools.forEach((t) => {
    lines.push(`- [${t.name}](${SITE_URL}${t.url})`);
  });
  lines.push('');
  lines.push('## Latest Articles');
  lines.push('');
  articles.slice(0, 50).forEach((a: any) => {
    lines.push(`- [${a.title}](${SITE_URL}/${a.category?.slug || 'post'}/${a.slug})`);
  });
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
