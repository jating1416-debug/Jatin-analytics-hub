import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import CategoryFilter from '@/components/CategoryFilter';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, formatDate } from '@/lib/utils';
import type { ArticleWithCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; cat?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const cat = sp.cat || 'all';

  // DB error hone pe bhi page 500 nahi dega - friendly message dikhega
  let categories: { name: string; slug: string; _count: { articles: number } }[] = [];
  let articles: ArticleWithCategory[] = [];
  let recent: ArticleWithCategory[] = [];
  let popular: ArticleWithCategory[] = [];
  let total = 0;
  let dbError = false;

  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });

    const where = {
      status: 'PUBLISHED' as const,
      ...(cat !== 'all' ? { category: { slug: cat } } : {}),
    };

    [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { category: true, author: { select: { name: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),
      prisma.article.count({ where }),
    ]);

    [recent, popular] = await Promise.all([
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
  } catch (e) {
    dbError = true;
    console.error('DB error on homepage:', e);
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <>
      <Hero />
      <div className="layout-wrapper">
        <main className="posts-section">
          <h2 className="section-title">📝 Latest Articles</h2>
          <CategoryFilter />

          {dbError ? (
            <div className="category-empty" style={{ display: 'block' }}>
              <p>⚠️ Database se connect nahi ho paya — thodi der baad refresh karo.</p>
              <p style={{ fontSize: '0.8rem' }}>(Supabase project running hai? Database URL sahi hai? — Vercel env vars check karo)</p>
            </div>
          ) : articles.length === 0 ? (
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

          {!dbError && <Pagination page={page} totalPages={totalPages} basePath="/" />}
        </main>

        {!dbError && (
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
        )}
      </div>
    </>
  );
}
