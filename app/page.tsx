import Hero from '@/components/Hero';
import CategoryTiles from '@/components/CategoryTiles';
import ToolsStrip from '@/components/ToolsStrip';
import HotPicksCarousel from '@/components/HotPicksCarousel';
import PostList from '@/components/PostList';
import SidebarClient from '@/components/SidebarClient';

// HOME v4 - FAST static shell + PREMIUM sections:
// Hero → Category Tiles → Tools Strip → Hot Picks + Latest Articles + Sidebar
// Server pe koi DB query nahi - sab client-side light APIs se

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryTiles />
      <ToolsStrip />
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
