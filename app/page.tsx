import type { Metadata } from 'next';
import { cache, Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import TableOfContents from '@/components/TableOfContents';
import SidebarClient from '@/components/SidebarClient';
import ViewCounter from '@/components/ViewCounter';
import PostProcessor from '@/components/PostProcessor';
import SchemaMarkup from '@/components/SchemaMarkup';
import FeedbackWidget from '@/components/FeedbackWidget';
import FontSizeAdjuster from '@/components/FontSizeAdjuster';
import CommentsSection from '@/components/CommentsSection';
import TryInPlayground from '@/components/TryInPlayground';
import FocusModeButton from '@/components/FocusModeButton';
import TldrBox from '@/components/TldrBox';
import HeadingLinks from '@/components/HeadingLinks';
import AdSlots from '@/components/AdSlots';
import CodeHighlighter from '@/components/CodeHighlighter';
import ArticleExtrasNav, { RelatedPosts } from '@/components/ArticleExtras';
import { normalizeContentServer } from '@/lib/post-transform';
import { SITE_URL, formatDate, excerptFrom } from '@/lib/utils';

// ARTICLE PAGE v4 - LCP FAST + CRASH-PROOF:
// - metadata + page EK hi DB query (React cache) - critical path SIRF 1 query
// - h1 + content TURANT stream (related/series ab Suspense mein background mein)
//   -> LCP 5.7s se ~1-2s (title ke liye ab koi extra DB wait nahi)
// - Views SIRF client (ViewCounter) se count hote hain
// - 5 min CDN cache -> repeat visits INSTANT
// - maxDuration 60 -> Vercel 504 kabhi nahi

export const revalidate = 300; // 5 min cache - post fast kholo
export const maxDuration = 60; // Vercel function limit 60s (Hobby max)

// LCP FIX: latest 30 posts BUILD TIME pe static pre-render ho jaate hain
// -> pehli visit bhi CDN se INSTANT (DB hit nahi). Nayi posts on-demand.
export async function generateStaticParams() {
  try {
    const posts = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, category: { select: { slug: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });
    return posts.map((p) => ({ category: p.category?.slug || 'post', slug: p.slug }));
  } catch (e) {
    console.error('generateStaticParams error (build pe DB na ho to dynamic):', e);
    return [];
  }
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
