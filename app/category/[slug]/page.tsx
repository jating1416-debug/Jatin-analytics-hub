import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
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
import { SITE_URL, formatDate, excerptFrom } from '@/lib/utils';

// ARTICLE PAGE v3 - FAST + CRASH-PROOF (blogs kabhi atke nahi):
// - metadata + page EK hi DB query (React cache) - critical path SIRF 1 query
// - related/prev/next/series = BEST-EFFORT: 4s timeout ke baad skip (article phir bhi khulta hai)
// - Views SIRF client (ViewCounter) se count hote hain - server pe double count nahi
// - 5 min CDN cache -> repeat visits INSTANT
// - maxDuration 60 -> Vercel 504 kabhi nahi (pehle slow DB pe function time-out ho jata tha)

export const revalidate = 300; // 5 min cache - post fast kholo
export const maxDuration = 60; // Vercel function limit 60s (Hobby max)

// DB slow/hang ho to 4s ke baad wait karna band karo (page kabhi nahi atkega)
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('db-timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

const getPost = cache(async (slug: string) => {
  return prisma.article.findUnique({
    where: { slug },
    include: { category: true, author: { select: { name: true } } },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let post: Awaited<ReturnType<typeof getPost>> = null;
  try {
    post = await getPost(slug);
  } catch (e) {
    console.error('article metadata error:', e);
  }
  if (!post || post.status !== 'PUBLISHED') return { title: 'Post not found' };

  const title = post.metaTitle || post.title;
  const desc = post.metaDescription || excerptFrom(post.content, 160);
  const url = `${SITE_URL}/${post.category?.slug || 'post'}/${post.slug}`;
  const image = post.ogImage || post.coverImage || undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: post.canonicalUrl || url },
    robots: post.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title, description: desc, url, images: image ? [image] : undefined, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: desc, images: image ? [image] : undefined },
  };
}

// Reserved top-level segments - inhe kabhi article route pe match nahi hona chahiye
const RESERVED_SEGMENTS = new Set(['category', 'tag', 'tools', 'admin', 'login', 'search', 'saved', 'contact', 'archive', 'author', 'downloads', 'p', 'api', 'feed.xml', 'sitemap.xml', 'robots.txt']);

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;

  // Static route missing hone pe bhi galat page render nahi hoga
  if (RESERVED_SEGMENTS.has(category)) notFound();

  let post: Awaited<ReturnType<typeof getPost>> = null;
  let dbError = false;
  try {
    post = await getPost(slug);
  } catch (e) {
    dbError = true;
    console.error('DB error article page:', e);
  }

  // DB fail hone pe friendly message (bina crash)
  if (dbError || !post || post.status !== 'PUBLISHED') {
    if (!dbError) notFound();
    return (
      <div className="layout-wrapper">
        <main className="posts-section">
          <div className="category-empty" style={{ display: 'block' }}>
            <p>⚠️ Database se connect nahi ho paya — thodi der baad refresh karo.</p>
          </div>
        </main>
      </div>
    );
  }

  // Galat category URL (e.g. /sql/python-post) -> sahi URL pe 301
  if (post.category?.slug && post.category.slug !== category) {
    permanentRedirect(`/${post.category.slug}/${post.slug}`);
  }

  // FAQ items extract karo (SEO: FAQPage schema ke liye)
  const faqItems: { q: string; a: string }[] = [];
  try {
    const faqBlocks = post.content.match(/<div class="faq-block">([\s\S]*?)<\/div>/g) || [];
    faqBlocks.forEach((block) => {
      const q = block.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
      const a = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (q && a) {
        const clean = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
        faqItems.push({ q: clean(q[1]).slice(0, 200), a: clean(a[1]).slice(0, 500) });
      }
    });
  } catch (e) { console.error('faq extract error:', e); }

  const catSlug = post.category?.slug || 'post';
  const url = `${SITE_URL}/${catSlug}/${post.slug}`;

  // RELATED + PREV/NEXT - BEST-EFFORT (4s timeout: slow DB pe bhi article khulta hai)
  let related: any[] = [];
  let prevPost: any = null;
  let nextPost: any = null;
  try {
    // prev + related: same category, purani posts (4 sabse paas wali)
    const older = await withTimeout(prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: post.categoryId, publishedAt: { lt: post.publishedAt || new Date() } },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }), 4000);
    prevPost = older[0] || null;
    related = older.slice(1, 4);

    // next: same category, nayi post (sirf 1)
    nextPost = await withTimeout(prisma.article.findFirst({
      where: { status: 'PUBLISHED', categoryId: post.categoryId, publishedAt: { gt: post.publishedAt || new Date() } },
      include: { category: true },
      orderBy: { publishedAt: 'asc' },
    }), 4000);
  } catch (e) { console.error('related error (safely skipped):', e); }

  // SERIES - saare parts + prev/next in series (best-effort, 4s timeout)
  let seriesParts: any[] = [];
  let seriesPrev: any = null;
  let seriesNext: any = null;
  let seriesTitle: string | null = null;
  if (post.seriesId) {
    try {
      // series ka naam alag guarded query se (schema na ho to bhi blog khulega)
      try {
        const s = await withTimeout((prisma as any).articleSeries.findUnique({ where: { id: post.seriesId } }), 4000);
        seriesTitle = s?.title || null;
      } catch (e) { console.error('series title error (safely skipped):', e); }
      seriesParts = await withTimeout(prisma.article.findMany({
        where: { status: 'PUBLISHED', seriesId: post.seriesId },
        include: { category: true },
        orderBy: [{ seriesOrder: 'asc' }, { publishedAt: 'desc' }],
      }), 4000);
      const idx = seriesParts.findIndex((x: any) => x.id === post.id);
      if (idx > 0) seriesPrev = seriesParts[idx - 1];
      if (idx >= 0 && idx < seriesParts.length - 1) seriesNext = seriesParts[idx + 1];
    } catch (e) { console.error('series parts error:', e); }
  }

  return (
    <>
      <SchemaMarkup
        title={post.title}
        url={url}
        description={post.metaDescription || post.excerpt}
        image={post.coverImage || post.ogImage}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        categoryName={post.category?.name}
        categoryUrl={post.category ? `${SITE_URL}/category/${post.category.slug}` : undefined}
        authorName={post.author?.name || 'Jatin Kumar'}
        faq={faqItems.length > 0 ? faqItems : undefined}
      />
      <div className="layout-wrapper toc-3col">
        <TableOfContents html={post.content} />
        <main className="posts-section">
          <div className="post-content-wrapper">
            <div className="breadcrumb">
              <a href="/" style={{ color: 'var(--primary)' }}><i className="fas fa-home" style={{ marginRight: 5 }} />Home</a>
              <span className="breadcrumb-sep">/</span>
              {post.category && (
                <>
                  <a href={`/category/${catSlug}`} style={{ color: 'var(--primary)' }}>{post.category.name}</a>
                  <span className="breadcrumb-sep">/</span>
                </>
              )}
              <span className="breadcrumb-current">{post.title.slice(0, 50)}...</span>
            </div>
            <h1 className="article-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.28, marginBottom: 20, letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <FontSizeAdjuster />
              <FocusModeButton />
            </div>
            <TldrBox />
            <div className="post-meta" style={{ marginBottom: 25, paddingBottom: 20, borderBottom: '2px solid var(--border)', flexWrap: 'wrap' }}>
              <span><i className="fas fa-calendar-alt" /> {formatDate(post.publishedAt || post.createdAt)}</span>
              <span><i className="fas fa-user" /> {post.author?.name || 'Jatin Kumar'}</span>
              <span><i className="fas fa-clock" /> {post.readingTime || 3} min read</span>
              {post.category && (
                <span>
                  <i className="fas fa-folder" /> <a href={`/category/${catSlug}`} className="post-tag" style={{ display: 'inline', margin: '0 4px' }}>{post.category.name}</a>
                </span>
              )}
            </div>

            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.title}
                style={{ width: '100%', borderRadius: 12, margin: '25px 0', boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }}
              />
            )}

            <HeadingLinks />
            <div
              className="post-body entry-content"
              style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-light)' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <AdSlots position="article" />

            {/* AUTHOR BOX */}
            <div className="author-box" style={{ marginTop: 30 }}>
              <div className="author-box-avatar">👤</div>
              <div className="author-box-info">
                <div className="author-box-name">{post.author?.name || 'Jatin Kumar'}</div>
                <div className="author-box-role" data-i18n="author.role">Data Analyst & Educator</div>
                <p className="author-box-bio">
                  Python, SQL, Power BI aur Excel mein practical tutorials likhta hoon —
                  taaki data analytics seekhna aasan ho. Portfolio: jatinanalytics.co.in
                </p>
                <div className="author-box-links">
                  <a href="https://jatinanalytics.co.in" target="_blank" rel="noopener"><i className="fas fa-globe" /> Portfolio</a>
                  <a href="https://linkedin.com/in/jatin-kumar-5a46a720a" target="_blank" rel="noopener"><i className="fab fa-linkedin" /> LinkedIn</a>
                  <a href="https://github.com/jating1416-debug" target="_blank" rel="noopener"><i className="fab fa-github" /> GitHub</a>
                  <a href="https://kaggle.com/jatinkhandelwal112" target="_blank" rel="noopener"><i className="fab fa-kaggle" /> Kaggle</a>
                  <a href="/author"><i className="fas fa-file-lines" /> All Articles</a>
                </div>
              </div>
            </div>

            {/* Prev / Next */}
            <div className="post-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, margin: '30px 0 10px', flexWrap: 'wrap' }}>
              {prevPost && (
                <a className="post-nav-link" href={`/${prevPost.category?.slug || 'post'}/${prevPost.slug}`} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', textDecoration: 'none' }}>
                  <span className="post-nav-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}><i className="fas fa-arrow-left" /> Previous Article</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{prevPost.title.slice(0, 60)}</span>
                </a>
              )}
              {nextPost && (
                <a className="post-nav-link" href={`/${nextPost.category?.slug || 'post'}/${nextPost.slug}`} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', textAlign: 'right' }}>
                  <span className="post-nav-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Next Article <i className="fas fa-arrow-right" /></span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{nextPost.title.slice(0, 60)}</span>
                </a>
              )}
            </div>

            {/* SERIES NAVIGATION */}
            {seriesParts.length > 1 && (
              <div className="series-nav" style={{ marginTop: 24 }}>
                <div className="series-nav-head">
                  <i className="fas fa-list-ol" /> Series: {seriesTitle || 'Part Series'}
                </div>
                <div className="series-nav-parts">
                  {seriesParts.map((sp, i) => (
                    <a
                      key={sp.id}
                      href={`/${sp.category?.slug || 'post'}/${sp.slug}`}
                      className={`series-nav-part${sp.id === post.id ? ' current' : ''}`}
                      title={sp.title}
                    >
                      {sp.seriesOrder || i + 1}
                    </a>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  {seriesPrev ? (
                    <a href={`/${seriesPrev.category?.slug || 'post'}/${seriesPrev.slug}`} className="series-nav-link">
                      <i className="fas fa-arrow-left" /> Part {seriesPrev.seriesOrder}: {seriesPrev.title.slice(0, 40)}
                    </a>
                  ) : <span />}
                  {seriesNext ? (
                    <a href={`/${seriesNext.category?.slug || 'post'}/${seriesNext.slug}`} className="series-nav-link">
                      Part {seriesNext.seriesOrder}: {seriesNext.title.slice(0, 40)} <i className="fas fa-arrow-right" />
                    </a>
                  ) : <span />}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="share-buttons" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '2px solid var(--border)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}><i className="fas fa-share-alt" /> Share:</span>
              <a aria-label="Share on WhatsApp" className="share-btn share-whatsapp" style={{ background: '#25D366', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noopener"><i className="fab fa-whatsapp" /></a>
              <a aria-label="Share on Facebook" className="share-btn share-facebook" style={{ background: '#1877F2', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener"><i className="fab fa-facebook-f" /></a>
              <a aria-label="Share on Twitter" className="share-btn share-twitter" style={{ background: '#000', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener"><i className="fab fa-twitter" /></a>
              <a aria-label="Share on LinkedIn" className="share-btn share-linkedin" style={{ background: '#0A66C2', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener"><i className="fab fa-linkedin-in" /></a>
              <a aria-label="Share on Telegram" className="share-btn share-telegram" style={{ background: '#229ED9', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener"><i className="fab fa-telegram-plane" /></a>
            </div>

            <CommentsSection articleId={post.id} />

            {related.length > 0 && (
              <div className="related-posts" style={{ marginTop: 30 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>
                  📚 More Articles Like This
                </h3>
                <div className="related-posts-grid">
                  {related.map((r) => (
                    <a key={r.id} className="related-post-card" href={`/${r.category?.slug || 'post'}/${r.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="related-post-card-body">
                        <h4>{r.title}</h4>
                        <div className="related-post-card-meta" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}><i className="fas fa-arrow-right" /> Read Article</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <SidebarClient />
      </div>

      {/* CLIENT WIDGETS: view counter + processor + playground + history */}
      <ViewCounter articleId={post.id} />
      <PostProcessor html={post.content} />
      <CodeHighlighter />
      <TryInPlayground />
      <FeedbackWidget />
      <script dangerouslySetInnerHTML={{ __html: `try { localStorage.setItem('di_current_post', JSON.stringify({ title: ${JSON.stringify(post.title)}, url: ${JSON.stringify('/' + catSlug + '/' + post.slug)} })); } catch(e){}` }} />
    </>
  );
}
