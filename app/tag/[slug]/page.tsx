import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, SITE_URL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: 'Tag not found' };
  return {
    title: `${tag.name} — Posts`,
    description: `All posts tagged with ${tag.name} on Data Insights.`,
    alternates: { canonical: `${SITE_URL}/tag/${slug}` },
  };
}

export default async function TagPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const where = { status: 'PUBLISHED' as const, tags: { some: { tagId: tag.id } } };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">🏷️ Tag: {tag.name} — {total} Posts</h2>
        {articles.length === 0 ? (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>😕 Is tag mein abhi koi post nahi hai.</p>
          </div>
        ) : (
          articles.map((a) => <ArticleCard key={a.id} article={a} />)
        )}
        <Pagination page={page} totalPages={totalPages} basePath={`/tag/${slug}`} />
      </main>
    </div>
  );
}
