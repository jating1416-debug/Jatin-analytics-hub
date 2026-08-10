import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, SITE_URL } from '@/lib/utils';

export const revalidate = 60; // ISR - 60s cache (fast repeat visits)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) return { title: 'Tag not found' };
    return { title: `${tag.name} — Posts`, description: `All posts tagged with ${tag.name}.`, alternates: { canonical: `${SITE_URL}/tag/${slug}` } };
  } catch {
    return { title: 'Posts' };
  }
}

export default async function TagPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  let total = 0;
  let dbError = false;

  try {
    const tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) notFound();
    const where = { status: 'PUBLISHED' as const, tags: { some: { tagId: tag.id } } };
    // SEQUENTIAL (pooler connection_limit=1 ke saath Promise.all avoid)
    articles = await prisma.article.findMany({ where, include: { category: true, author: { select: { name: true } } }, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * POSTS_PER_PAGE, take: POSTS_PER_PAGE });
    total = await prisma.article.count({ where });
  } catch (e) {
    dbError = true;
    console.error('Tag page DB error:', e);
  }

  if (dbError) {
    return (
      <div className="layout-wrapper">
        <main className="posts-section">
          <div className="category-empty" style={{ display: 'block' }}>
            <p>⚠️ Database se connect nahi ho paya — thodi der baad refresh karo.</p>
          </div>
        </main>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        {/* BREADCRUMB - SEO + user navigation */}
        <div className="breadcrumb" style={{ marginBottom: 18 }}>
          <a href="/" style={{ color: 'var(--primary)' }}><i className="fas fa-home" style={{ marginRight: 5 }} />Home</a>
          <span className="breadcrumb-sep">/</span>
          <a href="/search" style={{ color: 'var(--primary)' }}>Tags</a>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{slug}</span>
        </div>
        <h2 className="section-title">🏷️ Tag: {slug} — {total} Posts</h2>
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
