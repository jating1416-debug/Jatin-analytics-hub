import Hero from '@/components/Hero';
import CategoryTiles from '@/components/CategoryTiles';
import ToolsStrip from '@/components/ToolsStrip';
import HotPicksCarousel from '@/components/HotPicksCarousel';
import PostList from '@/components/PostList';
import SidebarClient from '@/components/SidebarClient';
import AdSlots from '@/components/AdSlots';

// HOME v6 - 100% STATIC (PERFORMANCE FINAL)
// - Server pe KOI DB query nahi -> TTFB hamesha ~0.2s (cache MISS pe bhi!)
//   (pehle ISR 300s tha -> cache expire pe 3s TTFB -> LCP 3.67s)
// - LCP element (navbar logo) turant paint hota hai -> LCP ~1s
// - Posts /api/posts se client-side (API 300s cached -> repeat fast)
// - Sidebar /api/sidebar se client-side (5min cache)
// - Sab widgets lazy-loaded (LazyWidgets)

export default function HomePage() {
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
          {/* SMOOTH - client-side filter + pagination (bina reload) */}
          <PostList />
        </main>

        <SidebarClient />
      </div>
    </>
  );
}
