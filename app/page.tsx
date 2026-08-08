import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import PostList from '@/components/PostList';
import Sidebar from '@/components/Sidebar';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // SIRF sidebar data server-side (categories, recent, popular) - halka
  let categories: { name: string; slug: string; _count: { articles: number } }[] = [];
  let recent: any[] = [];
  let popular: any[] = [];
  let totalPosts = 94; // fallback
  let dbError = false;

  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  } catch (e) { console.error('categories error:', e); dbError = true; }

  try {
    totalPosts = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  } catch (e) { console.error('count error:', e); }

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
  } catch (e) { console.error('sidebar error:', e); }

  return (
    <>
      <Hero
        stats={{
          posts: totalPosts,
          tools: 12,
          topics: categories.length || 7,
        }}
      />
      <div className="layout-wrapper">
        <main className="posts-section">
          <h2 className="section-title">
            <span className="section-chip"><i className="fas fa-newspaper" /></span>
            Latest Articles
          </h2>
          {/* SMOOTH - client-side filter + pagination (bina reload) */}
          <PostList />
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
