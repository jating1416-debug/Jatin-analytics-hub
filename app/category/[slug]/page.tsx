import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, CATEGORY_LABELS, SITE_URL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: 'Category not found' };
  const label = CATEGORY_LABELS[slug] || cat.name;
  return {
    title: `${label} Tutorials`,
    description: cat.description || `Learn ${label} with practical tutorials and examples.`,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) notFound();

  const where = { status: 'PUBLISHED' as const, categoryId: cat.id };
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
  const label = CATEGORY_LABELS[slug] || cat.name;

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <h2 className="section-title">📁 {label} — {total} Posts</h2>
        {articles.length === 0 ? (
          <div className="category-empty" style={{ display: 'block' }}>
            <p>😕 Is category mein abhi koi post nahi hai.</p>
            <p>Jald hi naye posts aa rahi hain!</p>
          </div>
        ) : (
          articles.map((a) => <ArticleCard key={a.id} article={a} />)
        )}
        <Pagination page={page} totalPages={totalPages} basePath={`/category/${slug}`} />
      </main>
    </div>
  );
}
