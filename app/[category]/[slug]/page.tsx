import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import TableOfContents from '@/components/TableOfContents';
import Sidebar from '@/components/Sidebar';
import { SITE_URL, formatDate, excerptFrom } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!post || post.status !== 'PUBLISHED') return { title: 'Post not found' };

  const title = post.metaTitle || post.title;
  const desc = post.metaDescription || excerptFrom(post.content, 160);
  const url = `${SITE_URL}/${post.category?.slug || 'post'}/${post.slug}`;
  const image = post.ogImage || post.coverImage || undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: post.canonicalUrl || url },
    openGraph: { title, description: desc, url, images: image ? [image] : undefined, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: desc, images: image ? [image] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof prisma.article.findUnique>> = null;
  let dbError = false;
  try {
    post = await prisma.article.findUnique({
      where: { slug },
      include: { category: true, author: { select: { name: true } } },
    });
  } catch (e) {
    dbError = true;
    console.error('DB error article page:', e);
  }
  if (dbError) {
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
  if (!post || post.status !== 'PUBLISHED') notFound();

  // increment view count (fire and forget)
  prisma.article.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const catSlug = post.category?.slug || 'post';
  const url = `${SITE_URL}/${catSlug}/${post.slug}`;

  // related: same category
  const related = await prisma.article.findMany({
    where: { status: 'PUBLISHED', categoryId: post.categoryId, id: { not: post.id } },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  // sidebar data
  let categories: { name: string; slug: string; _count: { articles: number } }[] = [];
  let recent: any[] = [];
  let popular: any[] = [];
  try {
    [categories, recent, popular] = await Promise.all([
      prisma.category.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { name: 'asc' } }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, include: { category: true }, orderBy: { publishedAt: 'desc' }, take: 5 }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, include: { category: true }, orderBy: { viewCount: 'desc' }, take: 5 }),
    ]);
  } catch (e) {
    console.error('Sidebar data error:', e);
  }

  // prev/next in same category
  const [prevPost, nextPost] = await Promise.all([
    prisma.article.findFirst({
      where: { status: 'PUBLISHED', categoryId: post.categoryId, publishedAt: { lt: post.publishedAt || new Date() } },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, category: { select: { slug: true } } },
    }),
    prisma.article.findFirst({
      where: { status: 'PUBLISHED', categoryId: post.categoryId, publishedAt: { gt: post.publishedAt || new Date() } },
      orderBy: { publishedAt: 'asc' },
      select: { title: true, slug: true, category: { select: { slug: true } } },
    }),
  ]);

  return (
    <>
      <TableOfContents html={post.content} />
      <div className="layout-wrapper">
        <main className="posts-section">
          <div className="post-content-wrapper">
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3, marginBottom: 20 }}>
              {post.title}
            </h1>

            <div className="post-meta" style={{ marginBottom: 25, paddingBottom: 20, borderBottom: '2px solid var(--border)', flexWrap: 'wrap' }}>
              <span><i className="fas fa-calendar-alt" /> {formatDate(post.publishedAt || post.createdAt)}</span>
              <span><i className="fas fa-user" /> {post.author?.name || 'Jatin Kumar'}</span>
              <span><i className="fas fa-clock" /> {post.readingTime || 3} min read</span>
              <span><i className="fas fa-eye" /> {post.viewCount} views</span>
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

            <div
              className="post-body entry-content"
              style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-light)' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

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

            {/* Share */}
            <div className="share-buttons" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '2px solid var(--border)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}><i className="fas fa-share-alt" /> Share:</span>
              <a className="share-btn share-whatsapp" style={{ background: '#25D366', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noopener"><i className="fab fa-whatsapp" /></a>
              <a className="share-btn share-facebook" style={{ background: '#1877F2', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener"><i className="fab fa-facebook-f" /></a>
              <a className="share-btn share-twitter" style={{ background: '#000', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener"><i className="fab fa-twitter" /></a>
              <a className="share-btn share-linkedin" style={{ background: '#0A66C2', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener"><i className="fab fa-linkedin-in" /></a>
              <a className="share-btn share-telegram" style={{ background: '#229ED9', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener"><i className="fab fa-telegram-plane" /></a>
            </div>

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

        <Sidebar
          categories={categories}
          recent={recent.map((p) => ({ title: p.title, slug: p.slug, categorySlug: p.category?.slug || 'uncategorized', date: formatDate(p.publishedAt || p.createdAt) }))}
          popular={popular.map((p) => ({ title: p.title, slug: p.slug, categorySlug: p.category?.slug || 'uncategorized', views: p.viewCount }))}
        />
      </div>
    </>
  );
}
