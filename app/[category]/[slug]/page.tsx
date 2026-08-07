import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import TableOfContents from '@/components/TableOfContents';
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

  const post = await prisma.article.findUnique({
    where: { slug },
    include: { category: true, author: { select: { name: true } } },
  });
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

  return (
    <>
      <TableOfContents html={post.content} />
      <div className="layout-wrapper">
        <main className="posts-section">
          <div className="post-content-wrapper">
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3, marginBottom: 20 }}>
              {post.title}
            </h1>

            <div className="post-meta" style={{ marginBottom: 25, paddingBottom: 20, borderBottom: '2px solid var(--border)' }}>
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

            <div
              className="post-body entry-content"
              style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-light)' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="post-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, margin: '30px 0 10px', flexWrap: 'wrap' }}>
              <a className="post-nav-link" href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noopener">
                <span className="post-nav-label"><i className="fab fa-whatsapp" /> Share on WhatsApp</span>
                <span className="post-nav-title">{post.title}</span>
              </a>
            </div>

            {related.length > 0 && (
              <div className="related-posts">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>
                  📚 More Articles Like This
                </h3>
                <div className="related-posts-grid">
                  {related.map((r) => (
                    <a key={r.id} className="related-post-card" href={`/${r.category?.slug || 'post'}/${r.slug}`}>
                      <div className="related-post-card-body">
                        <h4>{r.title}</h4>
                        <div className="related-post-card-meta"><i className="fas fa-arrow-right" /> Read Article</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
