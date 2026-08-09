import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import CategoryTiles from '@/components/CategoryTiles';
import ToolsStrip from '@/components/ToolsStrip';
import HotPicksCarousel from '@/components/HotPicksCarousel';
import PostList from '@/components/PostList';
import SidebarClient from '@/components/SidebarClient';
import AdSlots from '@/components/AdSlots';

// HOME v5 - PERFORMANCE FINAL:
// - Posts ab SERVER-SIDE HTML mein (ISR 60s) - client ko /api/posts ka 6.9s wait nahi
//   -> Speed Index ka bada hissa khatam (mobile 80 -> 90+)
// - Sirf 1 DB query (94 posts ka light select) - 60 sec pe ek baar, phir CDN cache
// - Hero + tiles + posts sab HTML mein -> FCP/LCP/SI sab fast

export const revalidate = 60;

export default async function HomePage() {
  // SIRF 1 QUERY - saari posts (filters ke liye) - ISR 60s (CDN pe cached)
  let posts: any[] = [];
  try {
    posts = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        publishedAt: true, createdAt: true, readingTime: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });
  } catch (e) {
    console.error('home posts error:', e);
  }

  return (
    <>
      <Hero />
      <CategoryTiles />
      <ToolsStrip />
      <AdSlots position="home" />
      <div className="layout-wrapper">
        <main className="posts-section">
          <HotPicksCarousel />
          <h2 className="section-title">
            <span className="section-chip"><i className="fas fa-newspaper" /></span>
            <span data-i18n="sec.latest">Latest Articles</span>
          </h2>
          {/* SMOOTH - posts HTML mein turant + client-side filter/pagination */}
          <PostList initialPosts={posts as any} />
        </main>

        <SidebarClient />
      </div>
    </>
  );
}
