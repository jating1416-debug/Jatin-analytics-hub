import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import CategoryFilter from '@/components/CategoryFilter';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; cat?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const cat = sp.cat || 'all';

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  const where = {
    status: 'PUBLISHED' as const,
    ...(cat !== 'all' ? { category: { slug: cat } } : {}),
  };

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

  const [recent, popular] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <>
      <Hero />
      <div className="layout-wrapper">
        <main className="posts-section">
          <h2 className="section-title">📝 Latest Articles</h2>
          <CategoryFilter />

          {articles.length === 0 ? (
            <div className="category-empty" style={{ display: 'block' }}>
              <p>😕 Is category mein abhi koi post nahi hai.</p>
              <p>
                Jald hi naye posts aa rahi hain — tab tak{' '}
                <a href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Home page
                </a>{' '}
                pe saari posts dekho!
              </p>
            </div>
          ) : (
            articles.map((a) => <ArticleCard key={a.id} article={a} />)
          )}

          <Pagination page={page} totalPages={totalPages} basePath="/" />
        </main>

        <Sidebar
          categories={categories}
          recent={recent.map((p) => ({
            title: p.title,
            slug: p.slug,
            categorySlug: p.category?.slug || 'uncategorized',
            date: formatDate(p.publishedAt || p.createdAt),
          }))}
          popular={popular.map((p) => ({
            title: p.title,
            slug: p.slug,
            categorySlug: p.category?.slug || 'uncategorized',
            views: p.viewCount,
          }))}
        />
      </div>
    </>
  );
}
