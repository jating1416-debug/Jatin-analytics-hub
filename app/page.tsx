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

  // Har section alag try/catch mein - ek fail ho to baaki site chale
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  } catch (e) { console.error('categories error:', e); dbError = true; }

  // counts (SEQUENTIAL - pool pe pressure kam, timeout nahi hoga)
  try {
    const allCount = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    counts = { all: allCount };
    for (const k of COUNT_KEYS) {
      if (k === 'error') {
        counts[k] = await prisma.article.count({ where: { status: 'PUBLISHED', content: { contains: 'error', mode: 'insensitive' } } });
      } else {
        counts[k] = await prisma.article.count({ where: { status: 'PUBLISHED', category: { slug: k } } });
      }
    }
  } catch (e) { console.error('counts error:', e); }

  // articles (main content - iska fail hona bada issue hai)
  try {
    const where: any = { status: 'PUBLISHED' };
    if (cat === 'error') {
      where.content = { contains: 'error', mode: 'insensitive' };
    } else if (cat !== 'all') {
      where.category = { slug: cat };
    }
    // sequential: pehle count, phir fetch (pool timeout avoid)
    total = await prisma.article.count({ where });
    articles = await prisma.article.findMany({
      where,
      include: { category: true, author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    });
  } catch (e) { console.error('articles error:', e); dbError = true; }

  // featured (optional)
  try {
    featured = await prisma.article.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });
  } catch (e) { console.error('featured error:', e); }

  // recent + popular (optional - sidebar)
  try {
    recent = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
    popular = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
    });
  } catch (e) { console.error('recent/popular error:', e); }

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
