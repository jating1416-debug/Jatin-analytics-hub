import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import CategoryFilter from '@/components/CategoryFilter';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import { POSTS_PER_PAGE, formatDate } from '@/lib/utils';
import type { ArticleWithCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

// counts ke liye: har category + error label
const COUNT_KEYS = ['sql', 'python', 'power-bi', 'excel', 'career', 'interview-questions', 'case-study', 'error'];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; cat?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const cat = sp.cat || 'all';

  let categories: { name: string; slug: string; _count: { articles: number } }[] = [];
  let articles: ArticleWithCategory[] = [];
  let recent: ArticleWithCategory[] = [];
  let popular: ArticleWithCategory[] = [];
  let featured: ArticleWithCategory[] = [];
  let total = 0;
  let dbError = false;
  let counts: Record<string, number> = {};

  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });

    // counts: category-wise + error label
    const countResults = await Promise.all([
      ...COUNT_KEYS.filter((k) => k !== 'error').map((k) =>
        prisma.article.count({ where: { status: 'PUBLISHED', category: { slug: k } } })
      ),
      prisma.article.count({ where: { status: 'PUBLISHED', content: { contains: 'error', mode: 'insensitive' } } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ]);
    const catCounts = countResults.slice(0, COUNT_KEYS.length - 1);
    const errorCount = countResults[COUNT_KEYS.length - 1];
    const allCount = countResults[COUNT_KEYS.length];
    counts = { all: allCount };
    COUNT_KEYS.forEach((k, i) => {
      if (k === 'error') counts[k] = errorCount;
      else counts[k] = catCounts[i];
    });

    // articles with cat filter + error special
    const where: any = { status: 'PUBLISHED' };
    if (cat === 'error') {
      where.content = { contains: 'error', mode: 'insensitive' };
    } else if (cat !== 'all') {
      where.category = { slug: cat };
    }

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

    featured = await prisma.article.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });

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
          {featured.length > 0 && (
            <div className="sidebar-widget" style={{ marginBottom: 24, padding: '18px 22px' }}>
              <div className="widget-title" style={{ marginBottom: 12 }}><i className="fas fa-star" /> ⭐ Featured Articles</div>
              <div className="related-posts-grid">
                {featured.map((f) => (
                  <a key={f.id} href={`/${f.category?.slug || 'post'}/${f.slug}`} className="related-post-card" style={{ textDecoration: 'none' }}>
                    <div className="related-post-card-body">
                      <h4>{f.title}</h4>
                      <div className="related-post-card-meta" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}><i className="fas fa-arrow-right" /> Read</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          <h2 className="section-title">📝 Latest Articles</h2>
          <CategoryFilter counts={counts} />

          {dbError ? (
            <div className="category-empty" style={{ display: 'block' }}>
              <p>⚠️ Database se connect nahi ho paya — thodi der baad refresh karo.</p>
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
